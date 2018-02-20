const _ = require('lodash');

const push = require('./push.js');
const notificationComposer = require('./notificationComposer.js');

/*
 * Push Functions
 */

/**
 * Sends a push message to specified pushToken
 * @param request.params {object} token and message to send
 */
Parse.Cloud.define('sendPushToOne', (request, response) => {
  const token = request.params.token;
  let message = request.params.message;
  if (message === undefined) {
    message = ''
  }

  push.sendPushWithMessage([token], message, response);
});

/**
 * Sends a push message to all users in DB
 */
Parse.Cloud.define('sendPushToAllUsers', (request, response) => {
  // send push update for data
  const userQuery = new Parse.Query(Parse.User);
  userQuery.find({
    success: function (users) {
      const pushTokens = [];
      _.forEach(users, (currentUser) => {
        if (currentUser.get('pushToken') !== undefined) {
          pushTokens.push(currentUser.get('pushToken'));
        }
      });

      const message = 'Hi! Welcome to LES! ' +
        'If you have any questions, please don\'t hesistate to ask!';
      push.sendPushWithMessage(pushTokens, message, response);
    },
    error: (error) => {
      response.error(error);
    }
  });

});

/**
 * Sends a silent push message to all users in DB.
 * Causes client to pull new data from DB
 */
Parse.Cloud.define('sendPushSilentRefresh', (request, response) => {
  // send push update for data
  const userQuery = new Parse.Query(Parse.User);
  userQuery.descending('createdAt');
  userQuery.find({
    success: (users) => {
      const pushTokens = [];
      _.forEach(users, (currentUser) => {
        if (currentUser.get('pushToken') !== undefined) {
          pushTokens.push(currentUser.get('pushToken'));
        }
      });

      console.log('Sending silent refresh for hotspots');
      push.sendSilentRefreshNotification(pushTokens, 'hotspot', response);

      console.log('Sending silent refresh for beacons');
      push.sendSilentRefreshNotification(pushTokens, 'beacon', response);
    },
    error: (error) => {
      response.error(error);
    }
  });
});

/*
 * Save triggers
 */

/**
 * Checks if any pieces of info are currently a terminator.
 *
 * @param terminators {object} mapping of keys to terminators
 * @param info {object} mapping of keys to current info value
 * @returns {boolean} if any pieces of info matches a corresponding terminator.
 */
const checkForTerminators = (terminators, info) => {
  for (let i in terminators) {
    if (info[i] === terminators[i]) {
      return true;
    }
  }

  return false;
};

// check if explicit app termination has happened
// Parse.Cloud.afterSave('pretracking_debug', (request) => {
//   if (request.object.get('console_string') === 'App about to terminate') {
//     var getUserForVendorId = new Parse.Query('user');
//     getUserForVendorId.equalTo('vendorId', request.object.get('vendor_id'));
//     getUserForVendorId.descending('createdAt');
//     getUserForVendorId.first({
//       success: (userObject) => {
//         var message = 'Hey ' + userObject.get('firstName') +
//                       '! It seems that LES closed on your phone. Swipe right to start me again!';
//         push.sendPushWithMessage(userObject.get('pushToken'), message);
//       },
//       error: (error) => {
//         console.log(error);
//       }
//     });
//   }
// });

/**
 * Aggregates data and archives locations if they are no longer valid
 */
Parse.Cloud.afterSave('pingResponse', (request) => {
  // thresholds for adding info and archiving hotspot
  const infoAddThreshold = 1;
  const archiveHotspotThreshold = 2;

  // get values from just saved object
  const responseId = request.object.id;
  const hotspotId = request.object.get('hotspotId');
  const question = request.object.get('question');
  const questionResponse = request.object.get('response');
  const timestamp = request.object.get('timestamp');

  // special cases --> don't save answer
  // "I don't know" for surprising things
  // "I don't come here regularly" for queues
  const responseExceptions = ['I don\'t know', 'I don\'t come here regularly',
    'com.apple.UNNotificationDefaultActionIdentifier',
    'com.apple.UNNotificationDismissActionIdentifier'
  ];
  if (responseExceptions.indexOf(questionResponse) !== -1) {
    return;
  }

  const getHotspotData = new Parse.Query('hotspot');
  getHotspotData.equalTo('objectId', hotspotId);
  getHotspotData.first({
    success: (hotspotObject) => {
      const saveTimes = hotspotObject.get('saveTimeForQuestion');
      const lastUpdateTimestamp = saveTimes[question];

      const responseForHotspot = new Parse.Query('pingResponse');
      responseForHotspot.equalTo('hotspotId', hotspotId);
      responseForHotspot.equalTo('question', question);
      responseForHotspot.greaterThanOrEqualTo('timestamp', lastUpdateTimestamp);
      responseForHotspot.find({
        success: (hotspotResponses) => {
          let similarResponseCount = 1;

          for (let i = 0; i < hotspotResponses.length; i++) {
            const currentResponse = hotspotResponses[i].get('response');

            if (currentResponse === questionResponse) {
              similarResponseCount++;
            }
          }

          if (similarResponseCount >= infoAddThreshold) {
            const newUpdateTimestamp = Math.round(Date.now() / 1000);
            const newInfo = hotspotObject.get('info');
            newInfo[question] = questionResponse;
            saveTimes[question] = newUpdateTimestamp;

            hotspotObject.set('saveTimeForQuestion', saveTimes);
            hotspotObject.set('info', newInfo);
            hotspotObject.save();
          }
        },
        error: (error) => {
          console.log(error);
        }
      });
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/**
 * Set Archiver value before saving
 */
Parse.Cloud.beforeSave('hotspot', (request, response) => {
  if (!request.object.get('archiver')) {
    request.object.set('archiver', '');
  }
  if (!request.object.get('beaconId')) {
    request.object.set('beaconId', '');
  }
  response.success();
});

/**
 * Archives old hotspots on either user response or system archive and sends data update to app
 */
Parse.Cloud.afterSave('hotspot', (request) => {
  const hotspot = request.object;
  const tag = hotspot.get('tag');
  const hotspotInfo = hotspot.get('info');
  const locationCommonName = hotspot.get('locationCommonName');

  // check if archived = true, if so stop
  if (hotspot.get('archived')) {
    return;
  }

  // check if any tracking terminators have been saved to info object
  // var foodTerminators = {
  //   'isfood': 'no',
  //   'foodtype': 'no food here',
  //   'howmuchfood': 'none'
  // };
  // var queueTerminators = {
  //   'isline': 'no'
  // };
  // var spaceTerminators = {
  //   'isspace': 'no'
  // };
  // var surprisingTerminators = {
  //   'whatshappening': 'no',
  //   'famefrom': 'no longer here',
  //   'vehicles': 'no longer here',
  //   'peopledoing': 'no longer here'
  // };
  //
  // var terminatorsExist = false;
  // switch (tag) {
  //   case 'food':
  //     terminatorsExist = checkForTerminators(foodTerminators, hotspotInfo);
  //     break;
  //   case 'queue':
  //     terminatorsExist = checkForTerminators(queueTerminators, hotspotInfo);
  //     break;
  //   case 'space':
  //     terminatorsExist = checkForTerminators(spaceTerminators, hotspotInfo);
  //     break;
  //   case 'surprising':
  //     terminatorsExist = checkForTerminators(surprisingTerminators,
  //       hotspotInfo);
  //     break;
  //   default:
  //     break;
  // }

  // if (terminatorsExist || hotspot.get('archiver') === 'system') {
  if (hotspot.get('archiver') === 'system') {
    // archive old hotspot (user is archiver unless background job archives)
    hotspot.set('archived', true);
    if (hotspot.get('archiver') === '') {
      hotspot.set('archiver', 'user');
    }
    hotspot.save();

    // recreate pre-marked locations
    if (locationCommonName !== '') {
      // create new values for hotspot
      const timestamp = Math.round(Date.now() / 1000);
      const newInfo = JSON.parse(JSON.stringify(hotspotInfo));
      const newSaveTimes = JSON.parse(JSON.stringify(hotspotInfo));
      for (let i in hotspotInfo) {
        newInfo[i] = '';
        newSaveTimes[i] = timestamp;
      }

      // save new hotspot
      const parseHotspot = Parse.Object.extend('hotspot');
      const newHotspot = new parseHotspot();
      newHotspot.set('vendorId', '');
      newHotspot.set('tag', tag);
      newHotspot.set('info', newInfo);
      newHotspot.set('location', hotspot.get('location'));
      newHotspot.set('beaconId', hotspot.get('beaconId'));
      newHotspot.set('archived', false);
      newHotspot.set('archiver', '');
      newHotspot.set('timestampCreated', timestamp);
      newHotspot.set('gmtOffset', hotspot.get('gmtOffset'));
      newHotspot.set('timestampLastUpdate', timestamp);
      newHotspot.set('submissionMethod', '');
      newHotspot.set('locationCommonName', locationCommonName);
      newHotspot.set('saveTimeForQuestion', newSaveTimes);
      newHotspot.save();
    }
  }

  // send push update for data
  const userQuery = new Parse.Query('user');
  userQuery.descending('createdAt');
  userQuery.find({
    success: (users) => {
      const pushTokens = [];

      for (let i in users) {
        const currentUser = users[i];

        if (currentUser.get('pushToken') !== undefined) {
          pushTokens.push(currentUser.get('pushToken'));
        }
      }

      console.log(pushTokens);
      push.sendSilentRefreshNotification(pushTokens, 'hotspot');
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/**
 * Send data refresh request if beacons are changed
 */
Parse.Cloud.afterSave('beacons', () => {
  // send push update for data
  const userQuery = new Parse.Query('user');
  userQuery.descending('createdAt');
  userQuery.find({
    success: (users) => {
      const pushTokens = [];

      for (let i in users) {
        const currentUser = users[i];

        if (currentUser.get('pushToken') !== undefined) {
          pushTokens.push(currentUser.get('pushToken'));
        }
      }

      console.log(pushTokens);
      push.sendSilentRefreshNotification(pushTokens, 'beacon');
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/**
 * Setup study conditions for each user after they register
 */
Parse.Cloud.afterSave('user', (request, response) => {
  const vendorId = request.object.get('vendorId');
  const conditions = [
    '200-300-400',
    '200-400-300',
    '300-200-400',
    '300-400-200',
    '400-200-300',
    '400-300-200'
  ];

  // find last condition stored
  const conditionQuery = new Parse.Query('studyConditions');
  conditionQuery.descending('createdAt');
  conditionQuery.first({
    success: (lastCondition) => {
      // get next condition ordering and if should eXploit
      let newConditionString = '';
      let newConditionArray = [];
      let shouldExploit = false;

      if (lastCondition === undefined) {
        newConditionString = conditions[0];
      } else {
        const currentConditionOrdering = lastCondition.get('stringConditionOrdering');
        const conditionIndex = (conditions.indexOf(currentConditionOrdering) + 1) % conditions.length;
        newConditionString = conditions[conditionIndex];

        shouldExploit = !lastCondition.get('underExploit');
      }

      newConditionArray = newConditionString.split('-').map(Number);

      // check if conditons already exist for user
      const conditionQueryExists = new Parse.Query('studyConditions');
      conditionQueryExists.equalTo('vendorId', vendorId);
      conditionQueryExists.descending('createdAt');
      conditionQueryExists.first({
        success: (condition) => {
          if (condition === undefined) {
            // save new studyCondition object
            const StudyCondition = Parse.Object.extend('studyConditions');
            const newStudyCondition = new StudyCondition();
            newStudyCondition.set('vendorId', vendorId);
            newStudyCondition.set('stringConditionOrdering', newConditionString);
            newStudyCondition.set('conditionOrdering', newConditionArray);
            newStudyCondition.set('currentCondition', newConditionArray[0]);
            newStudyCondition.set('underExploit', shouldExploit);
            newStudyCondition.save();
          }

          response.success();
        },
        error: (error) => {
          console.log(error);
        }
      });
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/*
 * Study condition functions
 */

/**
 * Toggle whether user is currently under eXploit
 */
Parse.Cloud.define('toggleExploitCondition', (request, response) => {
  const studyConditionQuery = new Parse.Query('studyConditions');
  studyConditionQuery.each((user) => {
    user.set('underExploit', !user.get('underExploit'));
    user.save();
  }).then(() => {
    response.success();
  }, (error) => {
    response.error(error);
  });
});

/**
 * Toggle what distance condition user is currently in
 */
Parse.Cloud.define('rotateDistanceCondition', (request, response) => {
  const studyConditionQuery = new Parse.Query('studyConditions');
  studyConditionQuery.each((user) => {
    // get current condition
    const conditionArray = user.get('conditionOrdering');
    const currentCondition = user.get('currentCondition');

    // find condition index and increment by 1
    const newConditionIndex = (conditionArray.indexOf(currentCondition) + 1) % conditionArray.length;
    const nextCondition = conditionArray[newConditionIndex];

    // save new condition
    user.set('currentCondition', nextCondition);
    user.save();
  }).then(() => {
    response.success();
  }, (error) => {
    response.error(error);
  });
});

/*
 * Location Functions.
 * The functions below are used to retrieve locations for tracking.
 */

/**
 * Compute distance between two latitude, longitude pairs in meters using the Haversine Formula.
 *
 * @param p1 {object} first point as object with latitude and longitude keys
 * @param p2 {object} second point as object with latitude and longitude keys
 * @returns {number} distance, in meters, between p1 and p2
 */
const getDistance = (p1, p2) => {
  const R = 6378137; // Earth’s mean radius in meter
  const degToRad = Math.PI / 180; // Degree to radian conversion.

  const dLat = (p2.latitude - p1.latitude) * degToRad;
  const dLong = (p2.longitude - p1.longitude) * degToRad;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.latitude * degToRad) * Math.cos(p2.latitude * degToRad) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

/**
 * Returns numeric rank for preferences.
 *
 * @param category {string} category to determine rank for
 * @param preferences {object} all user preferences
 * @returns {number}
 */
const getRankForCategory = (category, preferences) => {
  if (preferences.firstPreference === category) {
    return 1;
  } else if (preferences.secondPreference === category) {
    return 2;
  } else if (preferences.thirdPreference === category) {
    return 3;
  } else if (preferences.fourthPreference === category) {
    return 4;
  } else {
    return 0;
  }
};

/**
 * Get n closest hotspots ranked by distance and preference
 *
 * @param request {object} { latitude: Int, longitude: Int, vendorId: Str, count: Int }
 */
Parse.Cloud.define('retrieveLocationsForTracking', (request, response) => {
  const currentLocation = {
    'latitude': request.params.latitude,
    'longitude': request.params.longitude
  };
  const distanceToHotspots = [];

  const preferenceQuery = new Parse.Query('user');
  preferenceQuery.equalTo('vendorId', request.params.vendorId);
  preferenceQuery.find({
    success: (preferences) => {
      const userPreferences = {
        'firstPreference': 0,
        'secondPreference': 0,
        'thirdPreference': 0,
        'fourthPreference': 0
      };

      if (preferences.length > 0) {
        const firstPreference = preferences[0].get('firstPreference');
        const secondPreference = preferences[0].get('secondPreference');
        const thirdPreference = preferences[0].get('thirdPreference');
        const fourthPreference = preferences[0].get('fourthPreference');

        userPreferences.firstPreference = firstPreference;
        userPreferences.secondPreference = secondPreference;
        userPreferences.thirdPreference = thirdPreference;
        userPreferences.fourthPreference = fourthPreference;
      }

      const preferenceDict = {
        'food': getRankForCategory('food', userPreferences),
        'queue': getRankForCategory('queue', userPreferences),
        'space': getRankForCategory('space', userPreferences),
        'surprising': getRankForCategory('surprising', userPreferences)
      };

      const prevRespondedQuery = new Parse.Query('pingResponse');
      prevRespondedQuery.equalTo('vendorId', request.params.vendorId);
      prevRespondedQuery.find({
        success: (prevNotifications) => {
          const prevNotificationLen = prevNotifications.length;

          // return locations sorted by distance and ranking for user
          const locationQuery = new Parse.Query('hotspot');
          locationQuery.limit(1000);
          locationQuery.notEqualTo('archived', true);

          locationQuery.find({
            success: (locations) => {
              for (let i = 0; i < locations.length; i++) {
                const currentHotspot = {
                  'objectId': locations[i].id,
                  'location': locations[i].get('location'),
                  'tag': locations[i].get('tag'),
                  'preference': preferenceDict[locations[i].get('tag')],
                  'archived': locations[i].get('archived')
                };

                currentHotspot.distance = getDistance(currentLocation,
                  currentHotspot.location);
                currentHotspot.distance = Math.round(currentHotspot.distance);

                // check if user has already been notified for the location
                let hotspotPrevNotified = false;
                if (prevNotificationLen > 0) {
                  for (let j = 0; j < prevNotificationLen; j++) {
                    const currentHotpotId = prevNotifications[j].get('hotspotId');
                    if (currentHotpotId === currentHotspot.objectId) {
                      hotspotPrevNotified = true;
                      break;
                    }
                  }
                }

                // check if user is one who initially marked it
                let didUserCreateLocation = false;
                if (locations[i].get('vendorId') === request.params.vendorId) {
                  didUserCreateLocation = true;
                }

                // check if current hotspot is archived from previous responses
                let isArchived = currentHotspot.archived;

                // push hotspot to array if conditions are met
                if (!hotspotPrevNotified && !didUserCreateLocation &&
                  !isArchived) {
                  distanceToHotspots.push(currentHotspot);
                }
              }

              distanceToHotspots.sort(sortBy('distance', {
                name: 'preference',
                primer: parseInt,
                reverse: false
              }));

              let topHotspots = distanceToHotspots;
              if (typeof request.params.count !== 'undefined') {
                topHotspots = distanceToHotspots.slice(0, request.params.count);
              }

              const hotspotList = [];
              for (let k = 0; k < topHotspots.length; k++) {
                hotspotList.push(topHotspots[k].objectId);
              }

              const hotspotQuery = new Parse.Query('hotspot');
              hotspotQuery.containedIn('objectId', hotspotList);

              hotspotQuery.find({
                success: (selectedHotspots) => {
                  response.success(selectedHotspots);
                },
                error: (error) => {
                  console.log(error);
                }
              });
            },
            error: (error) => {
              console.log(error);
            }
          });
        },
        error: (error) => {
          console.log(error);
        }
      });
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/**
 * Return closest n locations for tracking without preference weighting.
 * Do not include location if user has already answered a question about it.
 */
Parse.Cloud.define('naivelyRetrieveLocationsForTracking', (request, response) => {
  const currentLocation = {
    'latitude': request.params.latitude,
    'longitude': request.params.longitude
  };
  const distanceToHotspots = [];

  const prevRespondQuery = new Parse.Query('pingResponse');
  prevRespondQuery.equalTo('vendorId', request.params.vendorId);
  prevRespondQuery.descending('createdAt');
  prevRespondQuery.limit(1000);
  prevRespondQuery.find({
    success: (prevNotifications) => {
      const prevHotspotList = [];
      for (let prevNotification in prevNotifications) {
        prevHotspotList.push(prevNotifications[prevNotification].get('hotspotId'));
      }

      // return locations sorted by distance and ranking for user
      const locationQuery = new Parse.Query('hotspot');
      locationQuery.limit(1000);
      locationQuery.notEqualTo('archived', true); // check if not archived
      locationQuery.notEqualTo('vendorId', request.params.vendorId); // current user did not create
      locationQuery.notContainedIn('objectId', prevHotspotList); // user has not contributed to it
      locationQuery.find({
        success: (locations) => {

          for (let i = 0; i < locations.length; i++) {
            let currentHotspot = {
              'objectId': locations[i].id,
              'location': locations[i].get('location'),
              'tag': locations[i].get('tag'),
              'archived': locations[i].get('archived')
            };

            currentHotspot.distance = getDistance(currentLocation, currentHotspot.location);
            currentHotspot.distance = Math.round(currentHotspot.distance);
            distanceToHotspots.push(currentHotspot);
          }

          distanceToHotspots.sort((a, b) => {
            return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);
          });

          let topHotspots = distanceToHotspots;
          // if (typeof request.params.count != 'undefined') {
          //   topHotspots = distanceToHotspots.slice(0, request.params.count);
          // }
          topHotspots = distanceToHotspots.slice(0, 20);

          const hotspotList = [];
          for (let k = 0; k < topHotspots.length; k++) {
            hotspotList.push(topHotspots[k].objectId);
          }

          const hotspotQuery = new Parse.Query('hotspot');
          hotspotQuery.containedIn('objectId', hotspotList);

          hotspotQuery.find({
            success: (selectedHotspots) => {
              const output = [];
              for (let hotspot in selectedHotspots) {
                const currentHotspot = {
                  'objectId': selectedHotspots[hotspot].id,
                  'vendorId': selectedHotspots[hotspot].get('vendorId'),
                  'tag': selectedHotspots[hotspot].get('tag'),
                  'info': selectedHotspots[hotspot].get('info'),
                  'location': selectedHotspots[hotspot].get('location'),
                  'beaconId': selectedHotspots[hotspot].get('beaconId'),
                  'locationCommonName': selectedHotspots[hotspot].get('locationCommonName'),
                  'archived': selectedHotspots[hotspot].get('archived'),
                  'notificationCategory': '',
                  'message': '',
                  'contextualResponses': []
                };

                const notification = notificationComposer.createNotificationForTag(
                  currentHotspot.tag,
                  currentHotspot.info,
                  currentHotspot.locationCommonName);
                if (notification !== undefined) {
                  currentHotspot.notificationCategory = notification.notificationCategory;
                  currentHotspot.message = notification.message;
                  currentHotspot.contextualResponses = notification.contextualResponses;

                  output.push(currentHotspot);
                }
              }

              response.success(output);
            },
            error: (error) => {
              console.log(error);
            }
          });
        },
        error: (error) => {
          console.log(error);
        }
      });
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/**
 * Return closest n locations for tracking without preference weighting
 * Do not include location if user has already answered a question about it
 * Do not include location if user has respondedly to eXpand negatively
 */
Parse.Cloud.define('retrieveExpandExploitLocations', (request, response) => {
  const currentLocation = {
    'latitude': request.params.latitude,
    'longitude': request.params.longitude
  };
  const distanceToHotspots = [];

  const prevRespondQuery = new Parse.Query('pingResponse');
  prevRespondQuery.equalTo('vendorId', request.params.vendorId);
  prevRespondQuery.descending('createdAt');
  prevRespondQuery.limit(1000);
  prevRespondQuery.find({
    success: (prevNotifications) => {
      const prevHotspotList = new Set();
      for (let prevNotification in prevNotifications) {
        prevHotspotList.add(prevNotifications[prevNotification].get('hotspotId'));
      }

      // fetch expand data
      const negativeExpandResponses = [
        'No, I have somewhere that I need to be.',
        'No, I\'m not interested.',
        'No, other reason.'
      ];
      const expandResponseQuery = new Parse.Query('expandResponses');
      expandResponseQuery.equalTo('vendorId', request.params.vendorId);
      expandResponseQuery.descending('createdAt');
      expandResponseQuery.containedIn('emaResponse', negativeExpandResponses);
      expandResponseQuery.limit(1000);
      expandResponseQuery.find({
        success: (expandResponses) => {
          for (let expandResponse in expandResponses) {
            prevHotspotList.add(expandResponses[expandResponse].get('hotspotId'));
          }

          // return locations sorted by distance and ranking for user
          // check if not archived
          // curr user did not create
          // user has not contributed to it
          const locationQuery = new Parse.Query('hotspot');
          locationQuery.limit(1000);
          locationQuery.notEqualTo('archived', true);
          locationQuery.notEqualTo('vendorId', request.params.vendorId);
          locationQuery.notContainedIn('objectId', Array.from(prevHotspotList));
          locationQuery.find({
            success: (locations) => {

              for (let i = 0; i < locations.length; i++) {
                const currentHotspot = {
                  'objectId': locations[i].id,
                  'location': locations[i].get('location'),
                  'tag': locations[i].get('tag'),
                  'archived': locations[i].get('archived')
                };

                currentHotspot.distance = getDistance(currentLocation, currentHotspot.location);
                currentHotspot.distance = Math.round(currentHotspot.distance);
                distanceToHotspots.push(currentHotspot);
              }

              distanceToHotspots.sort((a, b) => {
                return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);
              });

              let topHotspots = distanceToHotspots;
              topHotspots = distanceToHotspots.slice(0, 20);

              const hotspotList = [];
              for (let k = 0; k < topHotspots.length; k++) {
                hotspotList.push(topHotspots[k].objectId);
              }

              // from filtered list, get expand locations
              const hotspotQuery = new Parse.Query('hotspot');
              hotspotQuery.containedIn('objectId', hotspotList);
              hotspotQuery.find({
                success: (selectedHotspots) => {
                  // store both expand and exploit locations
                  const locationsToTrack = [];

                  for (let hotspot in selectedHotspots) {
                    const currExpandLoc = {
                      'objectId': selectedHotspots[hotspot].id,
                      'vendorId': selectedHotspots[hotspot].get('vendorId'),
                      'tag': selectedHotspots[hotspot].get('tag'),
                      'location': selectedHotspots[hotspot].get('location'),
                      'locationCommonName': selectedHotspots[hotspot].get('locationCommonName'),
                      'beaconId': selectedHotspots[hotspot].get('beaconId'),
                      'notificationCategory': '',
                      'message': '',
                      'scaffoldedMessage': '',
                      'contextualResponses': [],
                      'locationType': 'expand',
                      'levelOfInformation': '0'
                    };
                    const currentInfo = selectedHotspots[hotspot].get('info');
                    const notification = notificationComposer.createNotificationForTag(
                      currExpandLoc.tag,
                      currentInfo,
                      currExpandLoc.locationCommonName);
                    const scaffoldedMessage = notificationComposer.fetchScaffoldedInformationForTag(
                      currExpandLoc.tag,
                      currentInfo,
                      currExpandLoc.locationCommonName);

                    // include location iff it valid notification  at location and expand outer
                    if (notification !== undefined & scaffoldedMessage !== undefined) {
                      currExpandLoc.notificationCategory = notification.notificationCategory;
                      currExpandLoc.message = notification.message;
                      currExpandLoc.contextualResponses = notification.contextualResponses;

                      currExpandLoc.scaffoldedMessage = scaffoldedMessage.message;
                      currExpandLoc.levelOfInformation = scaffoldedMessage.levelOfInformation;

                      locationsToTrack.push(currExpandLoc);
                    }
                  }

                  // fetch exploit locations
                  const exploitLocQuery = new Parse.Query('exploitLocations');
                  exploitLocQuery.find({
                    success: (exploitLocations) => {
                      for (let exploitLocation in exploitLocations) {
                        const currExploitLoc = {
                          'objectId': exploitLocations[exploitLocation].id,
                          'vendorId': exploitLocations[exploitLocation].get('vendorId'),
                          'tag': exploitLocations[exploitLocation].get('tag'),
                          'location': exploitLocations[exploitLocation].get('location'),
                          'locationCommonName': '',
                          'beaconId': '',
                          'notificationCategory': 'exploit',
                          'message': exploitLocations[exploitLocation].get('question'),
                          'scaffoldedMessage': '',
                          'contextualResponses': ['yes', 'no'],
                          'locationType': 'exploit',
                          'levelOfInformation': '-1'
                        };

                        locationsToTrack.push(currExploitLoc);
                      }

                      // get study conditions for user
                      const studyConditionQuery = new Parse.Query('studyConditions');
                      studyConditionQuery.equalTo('vendorId', request.params.vendorId);
                      studyConditionQuery.descending('createdAt');
                      studyConditionQuery.first({
                        success: (conditions) => {
                          // return output
                          const output = {
                            'expandDistance': conditions.get('currentCondition'),
                            'allConditionDistances': [200, 300, 400],
                            'underExploit': conditions.get('underExploit'),
                            'locations': locationsToTrack
                          };

                          response.success(output);
                        },
                        error: (error) => {
                          console.log(error);
                          setTimeout(response.error('an error has occurred', 10000));
                        }
                      });
                    },
                    error: (error) => {
                      console.log(error);
                      setTimeout(response.error('an error has occurred', 10000));
                    }
                  });
                },
                error: (error) => {
                  console.log(error);
                  setTimeout(response.error('an error has occurred', 10000));
                }
              });
            },
            error: (error) => {
              console.log(error);
              setTimeout(response.error('an error has occurred', 10000));
            }
          });
        },
        error: (error) => {
          console.log(error);
          setTimeout(response.error('an error has occurred', 10000));
        }
      });
    },
    error: (error) => {
      console.log(error);
      setTimeout(response.error('an error has occurred', 10000));
    }
  });
});

/**
 * Creates a scaffolded message for a specific location.
 * Used primarily as a testing function.
 */
Parse.Cloud.define('createScaffoldedMessageForHotspot', (request, response) => {
  const hotspotId = request.params.hotspotId;

  const hotspotQuery = new Parse.Query('hotspot');
  hotspotQuery.equalTo('objectId', hotspotId);
  hotspotQuery.first({
    success: (hotspot) => {
      const message = notificationComposer.fetchScaffoldedInformationForTag(
        hotspot.get('tag'),
        hotspot.get('info'),
        hotspot.get('locationCommonName'));
      response.success(message);
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/*
 * UI Routes
 * Fetches data for various UI views.
 */

/**
 * Get ranking for each user by contribution.
 * Weight primary contribute as 2x more than response to ping
 */
Parse.Cloud.define('rankingsByContribution', (request, response) => {
  const userQuery = new Parse.Query('user');
  userQuery.find({
    success: (users) => {
      const numberUsers = users.length;

      // convert users into object with location mark count and ping response count
      const userContribution = {};

      for (let i in users) {
        const currentUser = users[i];

        let displayName = currentUser.get('firstName').trim();
        displayName = displayName.concat(currentUser.get('lastName').trim().charAt(0));
        displayName = displayName.toLowerCase();

        if (displayName === '') {
          displayName = 'anonymous';
        }

        userContribution[currentUser.get('vendorId')] = {
          'displayName': displayName,
          'locationsMarked': 0,
          'notificationResponses': 0,
          'totalScore': 0
        };
      }

      // grab notification responses and aggregate for user
      const notificationResponseQuery = new Parse.Query('pingResponse');
      notificationResponseQuery.find({
        success: (notificationResponses) => {
          const notificationResponsesLen = notificationResponses.length;
          for (let i in notificationResponses) {
            let currentVendorId = notificationResponses[i].get('vendorId');
            userContribution[currentVendorId].notificationResponses += 1;
            userContribution[currentVendorId].totalScore += 1;
          }

          // grab hotspots and aggregate for user
          const locationQuery = new Parse.Query('hotspot');
          locationQuery.limit(1000);
          locationQuery.find({
            success: (locations) => {
              const locationCount = locations.length;
              for (let i in locations) {
                const currentVendorId = locations[i].get('vendorId');
                if (currentVendorId !== '') {
                  userContribution[currentVendorId].locationsMarked += 1;
                  userContribution[currentVendorId].totalScore += 2;
                }
              }

              // convert userContribution into array
              const leaderBoard = [];
              for (let key in userContribution) {
                leaderBoard.push(userContribution[key]);
              }

              // order by total score
              leaderBoard.sort((a, b) => {
                return (a.totalScore < b.totalScore) ? 1 : ((b.totalScore < a.totalScore) ? -1 : 0);
              });

              response.success(leaderBoard);
            },
            error: (error) => {
              console.log(error);
            }
          });
        },
        error: (error) => {
          console.log(error);
        }
      });
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/**
 * Fetches data when user taps on pin in the MapView
 */
Parse.Cloud.define('fetchMapDataView', (request, response) => {
  const output = [];
  const responseQuery = new Parse.Query('pingResponse');
  responseQuery.equalTo('hotspotId', request.params.hotspotId);
  responseQuery.notContainedIn('response', ['com.apple.UNNotificationDismissActionIdentifier',
    'com.apple.UNNotificationDefaultActionIdentifier',
    'I don\'t know', 'I don\'t come here regularly'
  ]);
  responseQuery.ascending('timestamp');
  responseQuery.find({
    success: (responses) => {
      if (responses.length > 0) {
        // parse out responses into relevant information
        const users = [];
        const responsesToAdd = [];

        for (let i in responses) {
          const newResponse = {
            'question': responses[i].get('question'),
            'answer': responses[i].get('response'),
            'timestamp': responses[i].get('timestamp') + responses[i].get('gmtOffset'),
            'vendorId': responses[i].get('vendorId'),
            'initials': ''
          };

          users.push(responses[i].get('vendorId'));
          responsesToAdd.push(newResponse);
        }

        // get initials for each response
        const userQuery = new Parse.Query('user');
        userQuery.containedIn('vendorId', users);
        userQuery.find({
          success: (users) => {
            if (users.length > 0) {
              for (let k in responsesToAdd) {
                for (let j in users) {
                  if (responsesToAdd[k].vendorId === users[j].get('vendorId')) {
                    let initials = '';
                    let username = users[j].get('firstName').trim();
                    username = username.concat(users[j].get('lastName').trim().charAt(0));
                    if (username === '') {
                      initials = 'AN';
                    } else {
                      initials = users[j].get('firstName').trim().charAt(0);
                      initials = initials.concat(users[j].get('lastName').trim().charAt(0));
                      initials = initials.toUpperCase();
                    }

                    responsesToAdd[k].initials = initials;
                    output.push(responsesToAdd[k]);
                    break;
                  }
                }
              }
            }
            response.success(output);
          },
          error: (error) => {
            console.log(error);
          }
        });
      } else {
        response.success(output);
      }
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/**
 * Fetches data to populate the UserProfileView
 */
Parse.Cloud.define('fetchUserProfileData', (request, response) => {
  const output = {
    'username': '',
    'initials': '',
    'contributionCount': 0,
    'markedLocationCount': 0,
    'peopleHelped': 1,
    'contributionLocations': []
  };

  const userQuery = new Parse.Query('user');
  userQuery.equalTo('vendorId', request.params.vendorId);
  userQuery.descending('createdAt');
  userQuery.find({
    success: (users) => {
      if (users.length > 0) {
        // parse out username and initials
        const currentUser = users[0];
        let username = currentUser.get('firstName').trim();
        let initials = '';
        username = username.concat(currentUser.get('lastName').trim().charAt(0));
        username = username.toLowerCase();
        if (username === '') {
          username = 'anonymous';
          initials = 'AN';
        } else {
          initials = currentUser.get('firstName').trim().charAt(0);
          initials = initials.concat(currentUser.get('lastName').trim().charAt(0));
          initials = initials.toUpperCase();
        }
        output.username = username;
        output.initials = initials;

        const responseQuery = new Parse.Query('pingResponse');
        responseQuery.equalTo('vendorId', request.params.vendorId);
        responseQuery.descending('timestamp');
        responseQuery.find({
          success: (responses) => {
            // contribution count and contributions where user has responded to notifications
            const contributionHotspots = [];
            const contribLocationList = [];

            if (responses.length > 0) {
              output.contributionCount = responses.length;
              for (let i in responses) {
                const newContributionLocation = {
                  'category': responses[i].get('tag').trim(),
                  'timestamp': responses[i].get('timestamp'),
                  'contributionType': 'response',
                  'hotspotId': responses[i].get('hotspotId')
                };

                contributionHotspots.push(responses[i].get('hotspotId'));
                contribLocationList.push(newContributionLocation);
              }
            } else {
              output.contributionCount = 0;
            }

            // get locations for contributionLocations and any marked locations
            const genLocationQuery = new Parse.Query('hotspot');
            const contributionLocationQuery = new Parse.Query('hotspot');
            genLocationQuery.equalTo('vendorId', request.params.vendorId);
            contributionLocationQuery.containedIn('objectId', contributionHotspots);

            const mainQuery = new Parse.Query.or(genLocationQuery, contributionLocationQuery);
            mainQuery.descending('timestampCreated');
            mainQuery.find({
              success: (hotspots) => {
                if (hotspots.length > 0) {
                  for (let j in hotspots) {
                    if (hotspots[j].get('vendorId') === request.params.vendorId) {
                      const newMarkedLocation = {
                        'category': hotspots[j].get('tag').trim(),
                        'timestamp': hotspots[j].get('timestampCreated') +
                        hotspots[j].get('gmtOffset'),
                        'contributionType': 'marked',
                        'hotspotId': hotspots[j].id,
                        'latitude': parseFloat(hotspots[j].get('location').latitude),
                        'longitude': parseFloat(hotspots[j].get('location').longitude)
                      };

                      output.contributionLocations.push(newMarkedLocation);
                      output.markedLocationCount++;
                    } else {
                      for (let k in contribLocationList) {
                        if (contribLocationList[k].hotspotId === hotspots[j].id) {
                          contribLocationList[k].latitude = hotspots[j].get('location').latitude;
                          contribLocationList[k].longitude = hotspots[j].get('location').longitude;

                          output.contributionLocations.push(contribLocationList[k]);
                        }
                      }
                    }
                  }
                } else {
                  output.markedLocationCount = 0;
                }

                // select only first 10 contributions
                output.contributionLocations = output.contributionLocations.slice(0, 10);
                response.success(output);
              },
              error: (error) => {
                console.log(error);
              }
            });
          },
          error: (error) => {
            console.log(error);
          }
        });
      } else {
        output.username = 'anonymous';
        output.initials = 'AN';
        output.ranking = 0;
        output.contributionCount = 0;
        output.markedLocationCount = 0;
        output.peopleHelped = 0;

        response.success(output);
      }
    },
    error: (error) => {
      console.log(error);
    }
  });
});

/**
 * Multicolumn sorting function
 * From: http://stackoverflow.com/questions/6913512/how-to-sort-an-array-of-objects-by-multiple-fields.
 */
let sortBy;
(function () {
  // utility functions
  const defaultCmp = (a, b) => {
      if (a === b) {
        return 0;
      }
      return a < b ? -1 : 1;
    },
    getCmpFunc = (primer, reverse) => {
      const dfc = defaultCmp;
      let // closer in scope
        cmp = defaultCmp;
      if (primer) {
        cmp = (a, b) => {
          return dfc(primer(a), primer(b));
        };
      }
      if (reverse) {
        return (a, b) => {
          return -1 * cmp(a, b);
        };
      }
      return cmp;
    };

  // actual implementation
  sortBy = () => {
    const fields = [],
      nFields = arguments.length;
    let field, name, reverse, cmp;

    // preprocess sorting options
    for (let i = 0; i < nFields; i++) {
      field = arguments[i];
      if (typeof field === 'string') {
        name = field;
        cmp = defaultCmp;
      } else {
        name = field.name;
        cmp = getCmpFunc(field.primer, field.reverse);
      }
      fields.push({
        name: name,
        cmp: cmp
      });
    }

    // final comparison function
    return (A, B) => {
      let a, b, name, result;
      for (let i = 0; i < nFields; i++) {
        result = 0;
        field = fields[i];
        name = field.name;

        result = field.cmp(A[name], B[name]);
        if (result !== 0) {
          break;
        }
      }
      return result;
    };
  };
}());
