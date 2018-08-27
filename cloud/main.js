const _ = require('lodash');
const push = require('./push.js');

const dbFunctions = require('../init/dbFunctions');
const beaconInit = require('../init/populateBeacons');
const locationMetadataInit = require('../init/populateLocationMetadata');
const taskLocationInit = require('../init/populateTaskLocations');

const locationFunctions = require('./locationFunctions');
const composer = require('./notificationComposer');

/*
 * Push Functions
 */

/**
 * Sends a push message to specified pushToken
 * @param request.params {object} token and message to send
 */
Parse.Cloud.define('sendPushToOne', (request, response) => {
  const token = request.params.token;
  let message = request.params.message || '';

  push.sendPushWithMessage([token], message, response);
});

/**
 * Sends a push message to all users in DB
 */
Parse.Cloud.define('sendPushToAllUsersWithMessage', (request, response) => {
  // send push update for data
  const userQuery = new Parse.Query(Parse.User);
  userQuery.descending('createdAt');
  userQuery.find().then(users => {
    const pushTokens = [];

    // only take users who have a valid push token
    _.forEach(users, (currentUser) => {
      if (currentUser.get('pushToken') !== '') {
        pushTokens.push(currentUser.get('pushToken'));
      }
    });

    // send message included with request, otherwise default message
    let message = request.params.message || '';
    if (message === '') {
      message = 'Hi! Welcome to LES! ' +
        'If you have any questions, please don\'t hesitate to ask!';
    }

    push.sendPushWithMessage(pushTokens, message, response);
  }).catch(error => {
    response.error(error);
  });
});

/**
 * Sends a silent push message to all users in DB.
 * Causes client to pull new data from DB
 */
Parse.Cloud.define('refreshTrackedLocations', (request, response) => {
  // send push update for data
  const userQuery = new Parse.Query(Parse.User);
  userQuery.descending('createdAt');
  userQuery.find().then(users => {
    const pushTokens = [];
    _.forEach(users, (currentUser) => {
      if (currentUser.get('pushToken') !== '') {
        pushTokens.push(currentUser.get('pushToken'));
      }
    });

    console.log('Sending silent refresh for tracked locations');
    push.sendSilentRefreshNotification(pushTokens, 'trackedlocations', response);
  }).catch(error => {
    response.error(error);
  });
});

/**
 * Sends a silent push message to all users in DB.
 * Causes client to fetch and start tracking new beacons.
 */
Parse.Cloud.define('refreshTrackedBeacons', (request, response) => {
  // send push update for data
  const userQuery = new Parse.Query(Parse.User);
  userQuery.descending('createdAt');
  userQuery.find().then(users => {
    const pushTokens = [];
    _.forEach(users, (currentUser) => {
      if (currentUser.get('pushToken') !== '') {
        pushTokens.push(currentUser.get('pushToken'));
      }
    });

    console.log('Sending silent refresh for beacons');
    push.sendSilentRefreshNotification(pushTokens, 'beacon', response);
  }).catch(error => {
    response.error(error);
  });
});

/**
 * Sends a silent push message to all users in DB.
 * Causes client to request a location update and save said update to the DB.
 */
Parse.Cloud.define('requestLocationUpdate', (request, response) => {
  // send push update for data
  const userQuery = new Parse.Query(Parse.User);
  userQuery.descending('createdAt');
  userQuery.find().then(users => {
    const pushTokens = [];
    _.forEach(users, (currentUser) => {
      if (currentUser.get('pushToken') !== '') {
        pushTokens.push(currentUser.get('pushToken'));
      }
    });

    console.log('Sending silent refresh to get user\'s current location');
    push.sendSilentRefreshNotification(pushTokens, 'location', response);
  }).catch(error => {
    response.error(error);
  });
});

/*
 * Save triggers
 */

// check if explicit app termination has happened
// Parse.Cloud.afterSave('pretracking_debug', (request) => {
//   if (request.object.get('console_string') === 'App about to terminate') {
//     var getUserForVendorId = new Parse.Query(Parse.User);
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
Parse.Cloud.afterSave('AtLocationNotificationResponses', (request, response) => {
  // get values from just saved object
  const taskLocationId = request.object.get('taskLocationId');
  const question = request.object.get('question');
  const questionResponse = request.object.get('response');

  // special cases --> don't save answer
  // "I don't know" for surprising things
  // default apple responses
  const responseExceptions = ['I don\'t know',
    'com.apple.UNNotificationDefaultActionIdentifier',
    'com.apple.UNNotificationDismissActionIdentifier'
  ];

  if (responseExceptions.includes(questionResponse)) {
    return response.success('Response not added to TaskLocation since it is an exception.');
  }

  const taskLocationQuery = new Parse.Query('TaskLocations');
  taskLocationQuery.equalTo('objectId', taskLocationId);
  taskLocationQuery.first().then(taskLocationObject => {
    if (taskLocationObject !== undefined) {
      const newUpdateTimestamp = Math.round(Date.now() / 1000);

      const newSaveTimes = taskLocationObject.get('saveTimes');
      newSaveTimes[question] = newUpdateTimestamp;

      const newData = taskLocationObject.get('currentData');
      newData[question] = questionResponse;

      taskLocationObject.set('saveTimes', newSaveTimes);
      taskLocationObject.set('currentData', newData);
      taskLocationObject.save();
    }

    response.success();
  }).catch(error => {
    response.error(error);
  });
});

/**
 * Set Archiver value before saving
 */
Parse.Cloud.beforeSave('TaskLocations', (request, response) => {
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
Parse.Cloud.afterSave('TaskLocations', (request, response) => {
  const taskLocation = request.object;
  const locationType = taskLocation.get('locationType');
  const taskLocationInfo = taskLocation.get('currentData');
  const locationName = taskLocation.get('locationName');
  const locationMetadataId = taskLocation.get('metadataObject').id;

  // check if archived = true, if so stop
  if (taskLocation.get('archived')) {
    return;
  }

  // check if TaskLocation should be archived by seeing if there if there's another query available
  let locationTypeMetadataQuery = new Parse.Query('LocationTypeMetadata');
  locationTypeMetadataQuery.equalTo('objectId', locationMetadataId);
  locationTypeMetadataQuery.first().then(currentLocationMetadata => {
    if (currentLocationMetadata !== undefined) {
      const scaffoldStructure = currentLocationMetadata.get('scaffoldStructure');
      const loopbackQuestion = currentLocationMetadata.get('loopbackQuestion');

      let queryKey = composer.getNextQueryKey(scaffoldStructure, taskLocationInfo);
      if (queryKey === '') {
        // check if a loopback question is specified and positive value in scaffoldData
        if (loopbackQuestion !== '' &&
          taskLocationInfo[loopbackQuestion] !== 'no') {
          queryKey = loopbackQuestion;
        }
      }

      // if no further questions and not already archived, archive by user
      if (queryKey === '' && taskLocation.get('archiver') === '') {
        taskLocation.set('archiver', 'user response');
      }

      // archive old taskLocation if archiver isnt blank
      if (taskLocation.get('archiver') !== '') {
        taskLocation.set('archived', true);
        taskLocation.save();
      }

      // recreate location if now archived and was system created (e.g. submission method was blank)
      if (taskLocation.get('archived') && taskLocation.get('submissionMethod') === '') {
        if (locationName !== '') {
          // create new values for TaskLocation
          const timestamp = Math.round(Date.now() / 1000);
          const newInfo = JSON.parse(JSON.stringify(taskLocationInfo));
          const newSaveTimes = JSON.parse(JSON.stringify(taskLocationInfo));
          _.forEach(taskLocationInfo, (value, key) => {
            newInfo[key] = '';
            newSaveTimes[key] = timestamp;
          });

          // save new TaskLocation
          const TaskLocation = Parse.Object.extend('TaskLocations');
          const newTaskLocation = new TaskLocation();
          newTaskLocation.set('metadataObject', taskLocation.get('metadataObject'));
          newTaskLocation.set('location', taskLocation.get('location'));
          newTaskLocation.set('beaconId', taskLocation.get('beaconId'));
          newTaskLocation.set('locationType', locationType);
          newTaskLocation.set('locationName', locationName);
          newTaskLocation.set('locationHours', taskLocation.get('locationHours'));
          newTaskLocation.set('currentData', newInfo);
          newTaskLocation.set('saveTimes', newSaveTimes);
          newTaskLocation.set('archived', false);
          newTaskLocation.set('archiver', '');
          newTaskLocation.set('submissionMethod', '');
          newTaskLocation.set('vendorId', '');
          newTaskLocation.set('gmtOffset', taskLocation.get('gmtOffset'));
          newTaskLocation.save();
        }
      }
    }

    // always update users since something new is in the currentData scaffold
    const userQuery = new Parse.Query(Parse.User);
    userQuery.descending('createdAt');
    return userQuery.find();
  }).then(users => {
    const pushTokens = [];
    _.forEach(users, (currentUser) => {
      if (currentUser.get('pushToken') !== '') {
        pushTokens.push(currentUser.get('pushToken'));
      }
    });

    console.log('refreshing TaskLocation data for users: ', pushTokens);
    push.sendSilentRefreshNotification(pushTokens, 'trackedlocations', response);
  }).catch(error => {
    response.error(error);
  });
});

/**
 * Send data refresh request if beacons are changed
 */
Parse.Cloud.afterSave('beacons', (request, response) => {
  // send push update for data
  const userQuery = new Parse.Query(Parse.User);
  userQuery.descending('createdAt');
  userQuery.find().then(users => {
    const pushTokens = [];
    _.forEach(users, (currentUser) => {
      if (currentUser.get('pushToken') !== '') {
        pushTokens.push(currentUser.get('pushToken'));
      }
    });

    console.log('refreshing beacon data for users: ', pushTokens);
    push.sendSilentRefreshNotification(pushTokens, 'beacon', response);
  }).catch(error => {
    response.error(error);
  });
});

/*
 * Location Functions.
 * The functions below are used to retrieve locations for tracking.
 */

/**
 * Retrieves all locations to track for a given user, given conditions specified.
 * 4X: includeDistance = true, includeEnRoute = true, includeWithoutPref = false
 * Opp at Location: includeDistance = false, includeEnRoute = false, includeWithoutPref = false
 * Opp at Distance: includeDistance = true, includeEnRoute = false, includeWithoutPref = true
 *
 * @param request {object} { latitude: Int, longitude: Int, vendorId: Str}
 */
Parse.Cloud.define('retrieveLocations', (request, response) => {
  // what to include in retrievedLocations
  let includeDistance; // use only eXplore (locations when user immediately passes)
  let includeEnRoute; // include En Route Locations
  let includeWithoutPref; // include locations where preferred info is unavailable

  // 4X
  includeDistance = true;
  includeEnRoute = true;
  includeWithoutPref = false;

  // // opp at location
  // includeDistance = false;
  // includeEnRoute = false;
  // includeWithoutPref = false;

  // // opp at distance
  // includeDistance = true;
  // includeEnRoute = false;
  // includeWithoutPref = true;

  const lat = request.params.latitude;
  const lng = request.params.longitude;
  const vendorId = request.params.vendorId;
  const atDistanceNotifDistance = 300; // distance at which to notify when user is under AtDistance cond

  locationFunctions.fetchLocationsToTrack(includeDistance, includeEnRoute, includeWithoutPref,
    lat, lng, atDistanceNotifDistance, vendorId, response);
});

/*
 * Initialization Functions
 */
Parse.Cloud.define('createNewTaskLocation', (request, response) => {
  const geopoint = new Parse.GeoPoint({
    latitude: request.params.latitude,
    longitude: request.params.longitude
  });

  const result = dbFunctions.addTaskLocationToDB(geopoint,
    request.params.beaconId,
    request.params.locationType,
    request.params.locationName,
    request.params.locationHours,
    request.params.submissionMethod);

  if (result === '') {
    response.error(result);
  } else {
    response.success(result);
  }
});

Parse.Cloud.define('initializeBeacons', (request, response) => {
  beaconInit.populateBeacons();
  response.success();
});

Parse.Cloud.define('initializeMetaData', (request, response) => {
  locationMetadataInit.populateLocationMetadata();
  response.success();
});

Parse.Cloud.define('initializeTaskLocations', (request, response) => {
  taskLocationInit.populateTaskLocations();
  response.success();
});

/*
 * UI Routes
 * Fetches data for various UI views.
 */

/**
 * Fetches data when user taps on pin in the MapView
 */
// Parse.Cloud.define('fetchMapDataView', (request, response) => {
//   const output = [];
//   const responseQuery = new Parse.Query('pingResponse');
//   responseQuery.equalTo('hotspotId', request.params.hotspotId);
//   responseQuery.notContainedIn('response', ['com.apple.UNNotificationDismissActionIdentifier',
//     'com.apple.UNNotificationDefaultActionIdentifier',
//     'I don\'t know', 'I don\'t come here regularly'
//   ]);
//   responseQuery.ascending('timestamp');
//   responseQuery.find({
//     success: (responses) => {
//       if (responses.length > 0) {
//         // parse out responses into relevant information
//         const users = [];
//         const responsesToAdd = [];
//
//         for (let i in responses) {
//           const newResponse = {
//             'question': responses[i].get('question'),
//             'answer': responses[i].get('response'),
//             'timestamp': responses[i].get('timestamp') + responses[i].get('gmtOffset'),
//             'vendorId': responses[i].get('vendorId'),
//             'initials': ''
//           };
//
//           users.push(responses[i].get('vendorId'));
//           responsesToAdd.push(newResponse);
//         }
//
//         // get initials for each response
//         const userQuery = new Parse.Query(Parse.User);
//         userQuery.containedIn('vendorId', users);
//         userQuery.find({
//           success: (users) => {
//             if (users.length > 0) {
//               for (let k in responsesToAdd) {
//                 for (let j in users) {
//                   if (responsesToAdd[k].vendorId === users[j].get('vendorId')) {
//                     let initials = '';
//                     let username = users[j].get('firstName').trim();
//                     username = username.concat(users[j].get('lastName').trim().charAt(0));
//                     if (username === '') {
//                       initials = 'AN';
//                     } else {
//                       initials = users[j].get('firstName').trim().charAt(0);
//                       initials = initials.concat(users[j].get('lastName').trim().charAt(0));
//                       initials = initials.toUpperCase();
//                     }
//
//                     responsesToAdd[k].initials = initials;
//                     output.push(responsesToAdd[k]);
//                     break;
//                   }
//                 }
//               }
//             }
//             response.success(output);
//           },
//           error: (error) => {
//             console.log(error);
//           }
//         });
//       } else {
//         response.success(output);
//       }
//     },
//     error: (error) => {
//       console.log(error);
//     }
//   });
// });
