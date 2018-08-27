const dbFunctions = require('./dbFunctions');

/**
 * Create Beacons for each indoor location
 */
const populateBeacons = function populateAllBeaconLocations() {
  // // starbucks in norris
  // dbFunctions.addEstimoteBeaconsToDB(new Parse.GeoPoint(42.053391, -87.672911),
  //   'norris starbucks', 'alpha_1', 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', 7385, 39930);

  // main 1south
  dbFunctions.addEstimoteBeaconsToDB(new Parse.GeoPoint(42.052815, -87.674501),
    'main 1south', 'india_1', 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', 23166, 8527);

  // mudd common area
  dbFunctions.addEstimoteBeaconsToDB(new Parse.GeoPoint(42.058169, -87.674423),
    'mudd common area', 'juliet_1', 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', 19045, 27604);

  // spac
  dbFunctions.addEstimoteBeaconsToDB(new Parse.GeoPoint(42.059284, -87.673826),
    'spac', 'hotel_1', 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', 20487, 17646);

  // // blomquist
  // dbFunctions.addEstimoteBeaconsToDB(new Parse.GeoPoint(42.054274, -87.678216),
  //   'blomquist', 'foxtrot_1', 'B9407F30-F5F8-466E-AFF9-25556B57FE6D', 30333, 45043);
};

module.exports = {
  populateBeacons: populateBeacons
};