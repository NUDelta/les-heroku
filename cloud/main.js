const _ = require('lodash');
const push = require('./push.js');
const locationFunctions = require('./locationFunctions');

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

/*
 * Location Functions.
 * The functions below are used to retrieve locations for tracking.
 */

/**
 * Retrieves all locations to track for a given user.
 *
 * @param request {object} { latitude: Int, longitude: Int, vendorId: Str}
 */
Parse.Cloud.define('retrieveLocations', (request, response) => {
  const includeDistance = false; // use only eXplore (locations when user immediately passes)
  const includeEnRoute = false; // include En Route Locations
  const includeWithoutPref = false; // include locations where preferred info is unavailable

  const lat = request.params.latitude;
  const lng = request.params.longitude;
  const vendorId = request.params.vendorId;
  const atDistanceNotifDistance = 300; // distance at which to notify when user is under AtDistance cond

  locationFunctions.fetchLocationsToTrack(includeDistance, includeEnRoute, includeWithoutPref,
    lat, lng, atDistanceNotifDistance, vendorId, response);
});

/*
 * UI Routes
 * Fetches data for various UI views.
 */

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
