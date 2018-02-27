const dbFunctions = require('./dbFunctions');
const Parse = require('parse/node');
/*
 * Add TaskLocations
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

// delta lab
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.056963, -87.676673), '51wQBam0Nc', 'workspace', 'Delta Lab',
  {
    'sunday': [['0:00', '24:00']],
    'monday': [['0:00', '24:00']],
    'tuesday': [['0:00', '24:00']],
    'wednesday': [['0:00', '24:00']],
    'thursday': [['0:00', '24:00']],
    'friday': [['0:00', '24:00']],
    'saturday': [['0:00', '24:00']],
  });

/*
 * Add EnRoute locations
 */

dbFunctions.addEnRouteLocationsToDB(new Parse.GeoPoint(42.051548, -87.675907), 'misc',
  'The Rock', 'Do you see anyone currently guarding The Rock?', ['yes', 'no']);

dbFunctions.addEnRouteLocationsToDB(new Parse.GeoPoint(42.055636, -87.676695), 'parkingspace',
  'Garrett Parking Lot', 'Do you see any open parking spots in the Garrett Parking Lot?', ['yes', 'no']);

dbFunctions.addEnRouteLocationsToDB(new Parse.GeoPoint(42.058066, -87.677523), 'parkingspace',
  'Tech Parking Lot', 'Do you see any open parking spots in the Tech Parking Lot?', ['yes', 'no']);

dbFunctions.addEnRouteLocationsToDB(new Parse.GeoPoint(42.053433, -87.674949), 'bikerack',
  'Main Library Bike Rack', 'Do you see any open bike racks nearby Main Library?', ['yes', 'no']);

dbFunctions.addEnRouteLocationsToDB(new Parse.GeoPoint(42.059094, -87.674158), 'bikerack',
  'SPAC Bike Rack', 'Do you see any open bike racks nearby SPAC?', ['yes', 'no']);

dbFunctions.addEnRouteLocationsToDB(new Parse.GeoPoint(42.058331, -87.676974), 'bikerack',
  'Tech Bike Rack', 'Do you see any open bike racks nearby Tech?', ['yes', 'no']);

dbFunctions.addEnRouteLocationsToDB(new Parse.GeoPoint(42.053649, -87.676635), 'bikerack',
  'Old Kellogg Bike Rack', 'Do you see any open bike racks nearby old Kellogg?', ['yes', 'no']);

dbFunctions.addEnRouteLocationsToDB(new Parse.GeoPoint(42.054646, -87.67691), 'bikerack',
  'Lunt Bike Rack', 'Do you see any open bike racks nearby Lunt?', ['yes', 'no']);
