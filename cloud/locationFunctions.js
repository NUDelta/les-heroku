const _ = require('lodash');
const Parse = require('parse/node');
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
const fetchLocationsToTrack = function (includeDistance, includeEnRoute, includeWithoutPref, lat, lng, atDistanceNotifDistance, vendorId, response) {
  // create a Parse.GeoPoint for each location queries
  const locationGeopoint = new Parse.GeoPoint(lat, lng);

  // start by getting active (archived = true) TaskLocations where user is not the creator and
  // they have not contributed data to the TaskLocation
  const atLocationResponseQuery = new Parse.Query('AtLocationResponses');
  atLocationResponseQuery.equalTo('vendorId', vendorId);
  atLocationResponseQuery.descending('createdAt');
  atLocationResponseQuery.limit(1000);
  return atLocationResponseQuery.find().then(atLocationResponses => {
    // console.log('finding responses to existing locations: ', atLocationResponses);

    // get list of TaskLocations to exclude
    const locationIgnoreSet = new Set();
    _.forEach(atLocationResponses, (currLocationResponse) => {
      locationIgnoreSet.add(currLocationResponse.get('taskLocationId'));
    });

    // fetch all TaskLocation
    const taskLocationQuery = new Parse.Query('TaskLocations');
    taskLocationQuery.notEqualTo('archived', true); // location should still be active
    taskLocationQuery.notEqualTo('vendorId', vendorId); // user has not created the location
    taskLocationQuery.notContainedIn('objectId', Array.from(locationIgnoreSet)); // not responded to
    taskLocationQuery.include('metadataObject');
    taskLocationQuery.near('location', locationGeopoint);
    taskLocationQuery.limit(10);

    // fetch TaskLocations where user has received an AtDistance notification
    const atDistanceResponseQuery = new Parse.Query('AtDistanceResponses');
    atDistanceResponseQuery.equalTo('vendorId', vendorId);
    atDistanceResponseQuery.descending('createdAt');
    atDistanceResponseQuery.limit(1000);

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
      atDistanceResponseQuery.find(),
      preferenceQuery.first(),
      enRouteQuery.find()
    ]);
  }).then(values => {
    const taskLocations = values[0];
    const atDistanceResponses = values[1];
    const preferences = values[2].get('preferences');
    const enRouteLocations = values[3];

    // track all locations where user has already received an AtDistance notification
    const atDistanceIgnoreSet = new Set();
    _.forEach(atDistanceResponses, (currAtDistanceResponse) => {
      atDistanceIgnoreSet.add(currAtDistanceResponse.get('taskLocationId'));
    });

    // add locations
    const taskLocationsToTrack = [];
    
    // add each TaskLocation with notification text and other needed data
    _.forEach(taskLocations, (currTaskLocation) => {
      // TODO: check if location is open before notifying

      // create at location and at distance notifications
      const relevantPreferences = preferences[currTaskLocation.get('locationType')];
      const notification = composer.createNotifcationWithPreferences(relevantPreferences,
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

        // only include distance notifications if includeDistance is set
        if (includeDistance) {
          currLocation['atDistanceMessage'] = notification.atDistanceMessage;
          currLocation['atDistanceResponses'] = notification.atDistanceResponses;
          currLocation['shouldNotifyAtDistance'] = !atDistanceIgnoreSet.has(currTaskLocation.id);
          currLocation['atDistanceNotificationDistance'] = atDistanceNotifDistance;
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
          'vendorId': currEnRouteLocation.get('vendorId'),
          'tag': currEnRouteLocation.get('locationType'),
          'location': currEnRouteLocation.get('location'),
          'locationName': '',
          'beaconId': '',
          'notificationCategory': 'enroute',
          'atLocationMessage': currEnRouteLocation.get('question'),
          'atLocationResponses': ['yes', 'no', 'I don\'t know'],
          'atDistanceMessage': '',
          'atDistanceResponses': '',
          'preferredInfo': '',
          'shouldNotifyAtDistance': false,
          'atDistanceNotificationDistance': -1,
        };

        taskLocationsToTrack.push(currExploitLoc);
      });
    }

    // console.log('taskLocations: ', taskLocations);
    // console.log('atDistanceResponses: ', atDistanceResponses);
    // console.log('preferences: ', preferences);
    // console.log('enRouteLocations: ', enRouteLocations);

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