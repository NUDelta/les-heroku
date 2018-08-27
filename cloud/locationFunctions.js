const _ = require('lodash');
const moment = require('moment');

const composer = require('./notificationComposer.js');

/**
 * Get all locations to track for a user.
 *
 * @param includeDistance {boolean} whether AtDistance notifications are included
 * @param includeEnRoute {boolean} whether EnRoute notifications are included
 * @param includeWithoutPref {boolean} whether AtDistance notifications are included if preferences dont match
 * @param lat {number} user's current latitude
 * @param lng {number} user's current longitude
 * @param atDistanceNotifDistance {number} distance at which to send a AtDistance notification
 * @param vendorId {string} vendorId of current user
 * @param response {object} response object from caller
 * @returns {*|Promise<T>}
 */
const fetchLocationsToTrack = function (includeDistance, includeEnRoute, includeWithoutPref,
                                        lat, lng, atDistanceNotifDistance, vendorId, response) {
  // create a Parse.GeoPoint for each location queries
  const locationGeopoint = new Parse.GeoPoint(lat, lng);

  // get user responses to queries AtLocation
  const atLocationResponseQuery = new Parse.Query('AtLocationNotificationResponses');
  atLocationResponseQuery.equalTo('vendorId', vendorId);
  atLocationResponseQuery.descending('createdAt');
  atLocationResponseQuery.limit(1000);
  return atLocationResponseQuery.find().then(atLocationResponses => {
    // exclude TaskLocation if user has responded to the TaskLocation already
    const locationIgnoreSet = new Set();
    _.forEach(atLocationResponses, (currLocationResponse) => {
      locationIgnoreSet.add(currLocationResponse.get('taskLocationId'));
    });

    // fetch all active TaskLocation (archived = false) where user is not creator and has not
    // already responded to info at
    const taskLocationQuery = new Parse.Query('TaskLocations');
    taskLocationQuery.notEqualTo('archived', true); // location should still be active
    taskLocationQuery.notEqualTo('vendorId', vendorId); // user has not created the location
    taskLocationQuery.notContainedIn('objectId', Array.from(locationIgnoreSet)); // not responded to
    taskLocationQuery.include('metadataObject');
    taskLocationQuery.near('location', locationGeopoint);
    taskLocationQuery.limit(10);

    // AtDistance notification already sent to user
    const atDistanceResponsesExclude = [
      'No. This info is useful but I have to be somewhere.',
      'No. This info isn\'t useful to me.',
      'No. I don\'t want to go out of my way there.',
      'No. Other reason.'
    ];
    const prevRespondedAtDistanceResponseQuery = new Parse.Query('AtDistanceNotificationsSent');
    prevRespondedAtDistanceResponseQuery.equalTo('vendorId', vendorId);
    prevRespondedAtDistanceResponseQuery.descending('createdAt');
    prevRespondedAtDistanceResponseQuery.limit(1000);

    // fetch User preferences
    const preferenceQuery = new Parse.Query(Parse.User);
    preferenceQuery.equalTo('vendorId', vendorId);
    preferenceQuery.descending('createdAt');

    // fetch EnRouteLocations
    const enRouteQuery = new Parse.Query('EnRouteLocations');
    enRouteQuery.near('location', locationGeopoint);
    enRouteQuery.limit(10);

    return Promise.all([
      taskLocationQuery.find(),
      prevRespondedAtDistanceResponseQuery.find(),
      preferenceQuery.first(),
      enRouteQuery.find()
    ]);
  }).then(values => {
    const taskLocations = values[0];
    const prevAtDistanceNotifications = values[1];
    const enRouteLocations = values[3];

    // set preference variable if not undefined. if undefined, no preferences will be used
    let informationPreferences = {};
    let locationPreferences = {};
    if (values[2] !== undefined) {
      informationPreferences = values[2].get('informationPreferences');
      locationPreferences = values[2].get('locationPreferences');
    }

    // ignore location if user was already notified AtDistance
    const atDistanceIgnoreSet = new Set();
    _.forEach(prevAtDistanceNotifications, (currAtDistanceResponse) => {
      atDistanceIgnoreSet.add(currAtDistanceResponse.get('taskLocationId'));
    });

    // add locations
    const taskLocationsToTrack = [];

    // add each TaskLocation with notification text and other needed data
    _.forEach(taskLocations, (currTaskLocation) => {
      // TODO: check if location is open before notifying

      // create at location and at distance notifications
      const relevantInfoPreferences = informationPreferences[currTaskLocation.get('locationType')];
      const relevantLocationPreferences = locationPreferences[currTaskLocation.get('locationType')];

      const notification = composer.createNotifcationWithPreferences(relevantInfoPreferences,
        includeWithoutPref,
        currTaskLocation.get('metadataObject').toJSON(),
        currTaskLocation.get('currentData'),
        currTaskLocation.get('locationName'));

      // add new location if valid query for location exists
      if (notification !== undefined) {
        const currLocation = {
          'objectId': currTaskLocation.id,
          'vendorId': currTaskLocation.get('vendorId'),
          'locationType': currTaskLocation.get('locationType'),
          'location': currTaskLocation.get('location'),
          'locationName': currTaskLocation.get('locationName'),
          'beaconId': currTaskLocation.get('beaconId'),
          'notificationCategory': notification.notificationCategory,
          'atLocationMessage': notification.atLocationMessage,
          'atLocationResponses': notification.atLocationResponses,
          'preferredInfo': notification.preferredInfoMessage,
        };

        // only include atDistance if includeDistance is set and not in atDistanceIgnoreSet
        let inAtDistanceIgnoreSet = atDistanceIgnoreSet.has(currTaskLocation.id);
        if (includeDistance && !inAtDistanceIgnoreSet) {
          currLocation['atDistanceMessage'] = notification.atDistanceMessage;
          currLocation['atDistanceResponses'] = notification.atDistanceResponses;
          currLocation['atDistanceNotificationDistance'] = atDistanceNotifDistance;
          currLocation['shouldNotifyAtDistance'] = !inAtDistanceIgnoreSet &&
            notification.atDistanceMessage !== '';
        } else {
          currLocation['atDistanceMessage'] = '';
          currLocation['atDistanceResponses'] = [];
          currLocation['shouldNotifyAtDistance'] = false;
          currLocation['atDistanceNotificationDistance'] = -1;
        }

        taskLocationsToTrack.push(currLocation);
      }
    });

    // add EnRouteLocations
    if (includeEnRoute) {
      _.forEach(enRouteLocations, (currEnRouteLocation) => {
        const currExploitLoc = {
          'objectId': currEnRouteLocation.id,
          'vendorId': '',
          'locationType': currEnRouteLocation.get('locationType'),
          'location': currEnRouteLocation.get('location'),
          'locationName': '',
          'beaconId': '',
          'notificationCategory': 'enroute',
          'atLocationMessage': currEnRouteLocation.get('question'),
          'atLocationResponses': ['yes', 'no', 'I don\'t know'],
          'atDistanceMessage': '',
          'atDistanceResponses': [],
          'preferredInfo': '',
          'shouldNotifyAtDistance': false,
          'atDistanceNotificationDistance': -1,
        };

        taskLocationsToTrack.push(currExploitLoc);
      });
    }

    // for mocha testing
    if (response === undefined) {
      return taskLocationsToTrack;
    } else {
      response.success(taskLocationsToTrack);
    }
  }).catch(error => {
    // for mocha testing
    if (response === undefined) {
      return error;
    } else {
      setTimeout(response.error(error), 10000);
    }
  });
};

/**
 * Compute distance between two latitude, longitude pairs in meters using the Haversine Formula.
 *
 * @param p1 {object} first point as object with latitude and longitude keys
 * @param p2 {object} second point as object with latitude and longitude keys
 * @returns {number} distance, in meters, between p1 and p2
 */
const getDistance = function (p1, p2) {
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

module.exports = {
  fetchLocationsToTrack: fetchLocationsToTrack
};