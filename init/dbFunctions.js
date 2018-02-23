const _ = require('lodash');
const geoTz = require('geo-tz');
const moment = require('moment');
const Parse = require('parse/node');

Parse.initialize('PkngqKtJygU9WiQ1GXM9eC0a17tKmioKKmpWftYr');
Parse.serverURL = 'http://localhost:5000/parse/';

/**
 * Adds location metadata to DB if not already there.
 * All parameters map back to variables found in the composer.
 *
 * @param locationType
 * @param refreshTime
 * @param scaffold
 * @param scaffoldStructure
 * @param queries
 * @param queryAnswers
 */
const addLocationTypeMetadataToDB = function(locationType, refreshTime, scaffold,
                                             scaffoldStructure, queries, queryAnswers) {
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

/**
 * Adds a new task location to the database.
 *
 * @param location
 * @param beaconId
 * @param locationType
 * @param locationName
 * @param locationHours
 */
const addTaskLocationToDB = function(location, beaconId, locationType, locationName, locationHours) {
  // check if a taskLocation with the same name is already included
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
    let locationMetadataId = results[0].id;
    let currentData = results[0].get('scaffold');

    let currentTime = Math.round(Date.now() / 1000);
    let saveTimes = results[0].get('scaffold');
    _.forEach(saveTimes, (queryValue, queryKey) => {
      saveTimes[queryKey] = currentTime;
    });

    let locationTimezone = geoTz.tz(location.latitude, location.longitude);
    let utcTimezoneOffsetSeconds = moment.tz.zone(locationTimezone).utcOffset(currentTime) * 60;

    // create new location object
    let TaskLocation = Parse.Object.extend('TaskLocations');
    let newTaskLocation = new TaskLocation();
    newTaskLocation.set('metadataId', locationMetadataId);
    newTaskLocation.set('location', location);
    newTaskLocation.set('beaconId', beaconId);
    newTaskLocation.set('locationType', locationType);
    newTaskLocation.set('locationName', locationName);
    newTaskLocation.set('locationHours', locationHours);
    newTaskLocation.set('currentData', currentData);
    newTaskLocation.set('saveTimes', saveTimes);
    newTaskLocation.set('archived', false);
    newTaskLocation.set('submissionMethod', '');
    newTaskLocation.set('gmtOffset', utcTimezoneOffsetSeconds);
    return newTaskLocation.save();

  }).catch(error => {
    console.log(error);
  });
};

module.exports = {
  addLocationTypeMetadataToDB: addLocationTypeMetadataToDB,
  addTaskLocationToDB: addTaskLocationToDB
};