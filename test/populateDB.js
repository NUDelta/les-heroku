const _ = require('lodash');
const geoTz = require('geo-tz');
const moment = require('moment');
const Parse = require('parse/node');
const composer = require('../cloud/notificationComposer.js');

Parse.initialize('PkngqKtJygU9WiQ1GXM9eC0a17tKmioKKmpWftYr');
Parse.serverURL = 'http://localhost:5000/parse/';

/*
 * Add locationTypeMetadata
 */

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

addLocationTypeMetadataToDB(composer.coffeeshops.locationType,
  composer.coffeeshops.refreshTime,
  composer.coffeeshops.scaffold,
  composer.coffeeshops.scaffoldStructure,
  composer.coffeeshops.queries,
  composer.coffeeshops.queryAnswers);
addLocationTypeMetadataToDB(composer.gyms.locationType,
  composer.gyms.refreshTime,
  composer.gyms.scaffold,
  composer.gyms.scaffoldStructure,
  composer.gyms.queries,
  composer.gyms.queryAnswers);

/*
 * Add specific taskLocations
 */

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

// coffee lab
addTaskLocationToDB(new Parse.GeoPoint(42.058332, -87.683737), '', 'coffeeshop', 'Coffee Lab',
  {
    'sunday': [],
    'monday': [['07:00', '19:00']],
    'tuesday': [['07:00', '19:00']],
    'wednesday': [['07:00', '19:00']],
    'thursday': [['07:00', '19:00']],
    'friday': [['07:00', '19:00']],
    'saturday': [['08:00', '19:00']]
  });

// peets coffee
addTaskLocationToDB(new Parse.GeoPoint(42.046917, -87.679551), '', 'coffeeshop', 'Peet\'s Coffee',
  {
    'sunday': [['07:00', '20:00']],
    'monday': [['06:00', '20:00']],
    'tuesday': [['06:00', '20:00']],
    'wednesday': [['06:00', '20:00']],
    'thursday': [['06:00', '20:00']],
    'friday': [['06:00', '20:00']],
    'saturday': [['06:00', '20:00']]
  });

// starbucks on sherman
addTaskLocationToDB(new Parse.GeoPoint(42.049684, -87.682083), '', 'coffeeshop', 'Starbucks (on Sherman)',
  {
    'sunday': [['05:00', '24:00']],
    'monday': [['05:00', '24:00']],
    'tuesday': [['05:00', '24:00']],
    'wednesday': [['05:00', '24:00']],
    'thursday': [['05:00', '24:00']],
    'friday': [['05:00', '24:00']],
    'saturday': [['05:00', '24:00']]
  });

// norbucks on sherman
addTaskLocationToDB(new Parse.GeoPoint(42.053391, -87.672911), 'PUT BEACON ID HERE', 'coffeeshop', 'Starbucks (in Norris)',
  {
    'sunday': [['10:00', '23:45']],
    'monday': [['08:00', '23:45']],
    'tuesday': [['08:00', '23:45']],
    'wednesday': [['08:00', '23:45']],
    'thursday': [['08:00', '23:45']],
    'friday': [['08:00', '21:00']],
    'saturday': [['09:00', '21:00']],
  });

// spac
addTaskLocationToDB(new Parse.GeoPoint(42.059284, -87.673826), 'PUT BEACON ID HERE', 'gym', 'SPAC',
  {
    'sunday': [['8:00', '22:00']],
    'monday': [['6:00', '23:00']],
    'tuesday': [['6:00', '23:00']],
    'wednesday': [['6:00', '23:00']],
    'thursday': [['6:00', '23:00']],
    'friday': [['6:00', '22:00']],
    'saturday': [['8:00', '21:00']],
  });

// blomquist
addTaskLocationToDB(new Parse.GeoPoint(42.054281, -87.678212), 'PUT BEACON ID HERE', 'gym', 'Blomquist',
  {
    'sunday': [['8:00', '23:00']],
    'monday': [['7:00', '14:30'], ['18:30', '24:00']],
    'tuesday': [['7:00', '13:30'], ['17:30', '24:00']],
    'wednesday': [['7:00', '14:30'], ['18:30', '24:00']],
    'thursday': [['7:00', '13:30'], ['17:30', '24:00']],
    'friday': [['7:00', '13:30'], ['17:30', '20:00']],
    'saturday': [['8:00', '19:00']],
  });