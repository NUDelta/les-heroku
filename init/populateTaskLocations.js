const dbFunctions = require('./dbFunctions');
const Parse = require('parse/node');

Parse.initialize('PkngqKtJygU9WiQ1GXM9eC0a17tKmioKKmpWftYr');
Parse.serverURL = process.env.SERVER_URL || 'http://localhost:5000/parse';

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
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.053391, -87.672911), 'ekGHD1UW0G', 'coffeeshop', 'Starbucks (in Norris)',
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
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.059284, -87.673826), 'U6dNrYsSyk', 'gym', 'SPAC',
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
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.054281, -87.678212), 'cE9k7N4F4I', 'gym', 'Blomquist',
  {
    'sunday': [['8:00', '23:00']],
    'monday': [['7:00', '14:30'], ['18:30', '24:00']],
    'tuesday': [['7:00', '13:30'], ['17:30', '24:00']],
    'wednesday': [['7:00', '14:30'], ['18:30', '24:00']],
    'thursday': [['7:00', '13:30'], ['17:30', '24:00']],
    'friday': [['7:00', '13:30'], ['17:30', '20:00']],
    'saturday': [['8:00', '19:00']],
  });

// mudd common area
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.058169, -87.674423), 'Y6oyD2IvMA', 'workspace', 'Mudd Common Area (outside library)',
  {
    'sunday': [['10:00', '24:00']],
    'monday': [['00:00', '24:00']],
    'tuesday': [['00:00', '24:00']],
    'wednesday': [['00:00', '24:00']],
    'thursday': [['00:00', '24:00']],
    'friday': [['00:00', '24:00']],
    'saturday': [['10:00', '24:00']],
  });

// main 1south
dbFunctions.addTaskLocationToDB(new Parse.GeoPoint(42.052815, -87.674501), '3xNa2peiRk', 'workspace', 'Main 1South',
  {
    'sunday': [['10:00', '24:00'], ['00:00', '03:00']],
    'monday': [['08:00', '24:00'], ['00:00', '03:00']],
    'tuesday': [['08:00', '24:00'], ['00:00', '03:00']],
    'wednesday': [['08:00', '24:00'], ['00:00', '03:00']],
    'thursday': [['08:00', '24:00'], ['00:00', '03:00']],
    'friday': [['08:00', '24:00']],
    'saturday': [['10:00', '24:00']],
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

dbFunctions.addEnRouteLocationsToDB(new Parse.GeoPoint(42.053649, -87.676635), 'bikerack',
  'Old Kellogg Bike Rack', 'Do you see any open bike racks nearby old Kellogg?', ['yes', 'no']);
