const _ = require('lodash');
const geoTz = require('geo-tz');
const moment = require('moment');

/**
 * Adds location metadata to DB if not already there.
 *
 * All parameters map back to variables found in the composer.
 *
 * @param locationType
 * @param refreshTime
 * @param scaffold
 * @param scaffoldStructure
 * @param loopbackQuestion
 * @param queries
 * @param queryAnswers
 */
const addLocationTypeMetadataToDB = function (locationType, refreshTime, scaffold,
                                              scaffoldStructure, loopbackQuestion,
                                              queries, queryAnswers) {
  // check if locationType already exists in DB
  let locationTypeMetadataQuery = new Parse.Query('LocationTypeMetadata');
  locationTypeMetadataQuery.equalTo('locationType', locationType);
  locationTypeMetadataQuery.find().then(result => {
    if (result.length === 0) {
      // create new locationMetadata
      let LocationTypeMetadata = Parse.Object.extend('LocationTypeMetadata');
      let newLocationTypeMetadata = new LocationTypeMetadata();
      newLocationTypeMetadata.set('locationType', locationType);
      newLocationTypeMetadata.set('refreshTime', refreshTime);
      newLocationTypeMetadata.set('scaffold', scaffold);
      newLocationTypeMetadata.set('scaffoldStructure', scaffoldStructure);
      newLocationTypeMetadata.set('loopbackQuestion', loopbackQuestion);
      newLocationTypeMetadata.set('queries', queries);
      newLocationTypeMetadata.set('queryAnswers', queryAnswers);
      return newLocationTypeMetadata.save();
    }

    return '';
  }).then(result => {
    if (result === '') {
      console.log('location metadata for ' + locationType + ' already exists.')
    } else {
      console.log(result);
    }
  }).catch(error => {
    console.log(error);
  });
};

const addEstimoteBeaconsToDB = function (location, locationIdentifier, beaconIdentifier,
                                         uuid, major, minor) {
  // check if beacon with same uuid, major, minor already exists
  let beaconQuery = new Parse.Query('beacons');
  beaconQuery.equalTo('uuid', uuid);
  beaconQuery.equalTo('major', major);
  beaconQuery.equalTo('minor', minor);
  beaconQuery.find().then(result => {
    if (result.length === 0) {
      let Beacon = Parse.Object.extend('beacons');
      let newBeacon = new Beacon();
      newBeacon.set('location', location);
      newBeacon.set('locationIdentifier', locationIdentifier);
      newBeacon.set('beaconIdentifier', beaconIdentifier);
      newBeacon.set('uuid', uuid);
      newBeacon.set('major', major);
      newBeacon.set('minor', minor);
      return newBeacon.save();
    }

    return '';
  }).then(result => {
    if (result === '') {
      console.log('beacon for [' + [uuid, major, minor].join(', ') + '] already exists.')
    } else {
      console.log(result);
    }
  }).catch(error => {
    console.log(error);
  });
};

/**
 * Adds a new TaskLocation to the database.
 *
 * @param location
 * @param beaconId
 * @param locationType
 * @param locationName
 * @param locationHours
 * @param submissionMethod
 */
const addTaskLocationToDB = function (location, beaconId, locationType, locationName, locationHours,
                                      submissionMethod) {
  // check if a TaskLocation with the same name is already included
  let locationNameQuery = new Parse.Query('TaskLocations');
  locationNameQuery.equalTo('locationName', locationName);
  locationNameQuery.equalTo('archived', false);
  locationNameQuery.find().then(results => {
    if (results.length === 0) {
      // fetch id of associated metadata
      let locationTypeMetadataQuery = new Parse.Query('LocationTypeMetadata');
      locationTypeMetadataQuery.equalTo('locationType', locationType);
      return locationTypeMetadataQuery.find();
    }

    return '';
  }).then(results => {
    // only add if metadata exists and location doesn't already exist
    if (results === '') {
      console.log('task location for ' + locationName + ' already exists.');
      return '';
    } else if (results.length === 0) {
      console.log('location metadata for ' + locationType + ' was not found. not adding to db.');
      return '';
    }

    // setup data
    let currentData = JSON.parse(JSON.stringify(results[0].get('scaffold')));
    let currentTime = Math.round(Date.now() / 1000);
    let saveTimes = JSON.parse(JSON.stringify(results[0].get('scaffold')));
    _.forEach(saveTimes, (queryValue, queryKey) => {
      saveTimes[queryKey] = currentTime;
    });

    let locationTimezone = geoTz(location.latitude, location.longitude);
    let utcTimezoneOffsetSeconds = moment.tz.zone(locationTimezone).utcOffset(currentTime) * -60;

    // create new location object
    let TaskLocation = Parse.Object.extend('TaskLocations');
    let newTaskLocation = new TaskLocation();
    newTaskLocation.set('metadataObject', results[0]);
    newTaskLocation.set('location', location);
    newTaskLocation.set('beaconId', beaconId);
    newTaskLocation.set('locationType', locationType);
    newTaskLocation.set('locationName', locationName);
    newTaskLocation.set('locationHours', locationHours);
    newTaskLocation.set('currentData', currentData);
    newTaskLocation.set('saveTimes', saveTimes);
    newTaskLocation.set('archived', false);
    newTaskLocation.set('archiver', '');
    newTaskLocation.set('submissionMethod', submissionMethod || '');
    newTaskLocation.set('vendorId', '');
    newTaskLocation.set('gmtOffset', utcTimezoneOffsetSeconds);
    return newTaskLocation.save();

  }).catch(error => {
    console.log(error);
  });
};

/**
 * Adds a new EnRouteLocation to the database
 *
 * @param location
 * @param locationType
 * @param locationName
 * @param question
 * @param answers
 */
const addEnRouteLocationsToDB = function (location, locationType, locationName, question, answers) {
  // check if EnRoute location with same question already exists
  let enRouteLocationQuery = new Parse.Query('EnRouteLocations');
  enRouteLocationQuery.equalTo('locationName', locationName);
  enRouteLocationQuery.find().then(results => {
    if (results.length === 0) {
      // setup data
      let currentTime = Math.round(Date.now() / 1000);
      let locationTimezone = geoTz(location.latitude, location.longitude);
      let utcTimezoneOffsetSeconds = moment.tz.zone(locationTimezone).utcOffset(currentTime) * -60;

      let EnRouteLocation = Parse.Object.extend('EnRouteLocations');
      let newEnRouteLocation = new EnRouteLocation();
      newEnRouteLocation.set('location', location);
      newEnRouteLocation.set('locationType', locationType);
      newEnRouteLocation.set('locationName', locationName);
      newEnRouteLocation.set('question', question);
      newEnRouteLocation.set('answers', answers);
      newEnRouteLocation.set('gmtOffset', utcTimezoneOffsetSeconds);
      return newEnRouteLocation.save();
    } else {
      console.log('EnRouteLocation already for ' + locationName + ' already exists.')
    }
  }).catch(error => {
    console.log(error);
  });
};

module.exports = {
  addLocationTypeMetadataToDB: addLocationTypeMetadataToDB,
  addEstimoteBeaconsToDB: addEstimoteBeaconsToDB,
  addTaskLocationToDB: addTaskLocationToDB,
  addEnRouteLocationsToDB: addEnRouteLocationsToDB
};