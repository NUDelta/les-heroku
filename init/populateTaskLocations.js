const dbFunctions = require('./dbFunctions');
const Parse = require('parse/node');
/*
 * Add specific taskLocations
 */

// coffee lab
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.058332, -87.683737), '', 'coffeeshop', 'Coffee Lab',
  {
    'sunday': [],
    'monday': [['07:00', '19:00']],
    'tuesday': [['07:00', '19:00']],
    'wednesday': [['07:00', '19:00']],
    'thursday': [['07:00', '19:00']],
    'friday': [['07:00', '19:00']],
    'saturday': [['08:00', '19:00']]
  });

// peet's coffee
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.046917, -87.679551), '', 'coffeeshop', 'Peet\'s Coffee',
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
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.049684, -87.682083), '', 'coffeeshop', 'Starbucks (on Sherman)',
  {
    'sunday': [['05:00', '24:00']],
    'monday': [['05:00', '24:00']],
    'tuesday': [['05:00', '24:00']],
    'wednesday': [['05:00', '24:00']],
    'thursday': [['05:00', '24:00']],
    'friday': [['05:00', '24:00']],
    'saturday': [['05:00', '24:00']]
  });

// starbucks in norris
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.053391, -87.672911), 'PUT BEACON ID HERE', 'coffeeshop', 'Starbucks (in Norris)',
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
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.059284, -87.673826), 'PUT BEACON ID HERE', 'gym', 'SPAC',
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
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.054281, -87.678212), 'PUT BEACON ID HERE', 'gym', 'Blomquist',
  {
    'sunday': [['8:00', '23:00']],
    'monday': [['7:00', '14:30'], ['18:30', '24:00']],
    'tuesday': [['7:00', '13:30'], ['17:30', '24:00']],
    'wednesday': [['7:00', '14:30'], ['18:30', '24:00']],
    'thursday': [['7:00', '13:30'], ['17:30', '24:00']],
    'friday': [['7:00', '13:30'], ['17:30', '20:00']],
    'saturday': [['8:00', '19:00']],
  });