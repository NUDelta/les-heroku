const expect = require('chai').expect;
const composer = require('../cloud/notificationComposer');
const scaffolds = require('../init/scaffolds');
const location = require('../cloud/locationFunctions');

const Parse = require('parse/node');
Parse.initialize('PkngqKtJygU9WiQ1GXM9eC0a17tKmioKKmpWftYr');
Parse.serverURL = 'http://localhost:5000/parse/';

describe('coffee shop notification generation', () => {
  // specify overall structure
  let structure = scaffolds.coffeeshops;
  let locationName = 'Coffee Lab';

  it('empty scaffold should return query only', function () {
    // setup input data
    let scaffoldData = {
      privateseating: '',
      privateseatingoutlets: '',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_privateseating',
      message: 'Do you see private seating (individual tables/chairs) available at Coffee Lab?',
      contextualResponses: ['tables', 'couches/chairs', 'tables and couches/chairs', 'no']
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating as no should redirect to shared seating', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'no',
      privateseatingoutlets: '',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_sharedseating',
      message: 'Do you see shared seating (communal tables) available at Coffee Lab?',
      contextualResponses: [ 'yes', 'no' ]
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating as tables and couches/chairs should redirect to outlets', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'tables and couches/chairs',
      privateseatingoutlets: '',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_privateseatingoutlets',
      message: 'There is private seating (tables and couches/chairs), available at Coffee Lab. Do you see private seating (individual tables/chairs) near outlets at Coffee Lab?',
      contextualResponses: [ 'yes', 'no' ]
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating as tables and couches/chairs and no outlets should redirect to windows', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'tables and couches/chairs',
      privateseatingoutlets: 'no',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_privateseatingwindows',
      message: 'There is private seating (tables and couches/chairs), available at Coffee Lab. Do you see private seating (individual tables/chairs) near the windows at Coffee Lab?',
      contextualResponses: [ 'yes', 'no' ]
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('shared seating yes, outlets no should redirect to windows', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'tables and couches/chairs',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_sharedseatingwindows',
      message: 'There is private seating (tables and couches/chairs), and also shared seating (communal tables), available at Coffee Lab. Do you see shared seating (communal tables) near the windows available at Coffee Lab?',
      contextualResponses: [ 'yes', 'no' ]
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold should return undefined since nothing further can be asked', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'tables and couches/chairs',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'no'
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = undefined;

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('check fully scaffolded message', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'tables and couches/chairs',
      privateseatingoutlets: 'yes',
      privateseatingwindows: 'yes',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'yes'
    };

    // generate notification and compare
    let coffeeshopText = composer.createTextForScaffold(structure.scaffoldStructure, scaffoldData, locationName);
    let expectedOutput = 'There is private seating (tables and couches/chairs) near outlets and near windows, and also shared seating (communal tables) near windows, available at Coffee Lab.';

    expect(coffeeshopText).to.deep.equal(expectedOutput);
  });
});

describe('gym notification generation', () => {
  // specify overall structure
  let structure = scaffolds.gyms;
  let locationName = 'SPAC';

  it('empty scaffold should return query only', function () {
    // setup input data
    let scaffoldData = {
      treadmills: '',
      ellipticals: '',
      freeweights: '',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory:  'gym_treadmills',
      message: 'Do you see treadmills available at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('treadmills as no should redirect to ellipticals', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'no',
      ellipticals: '',
      freeweights: '',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory:  'gym_ellipticals',
      message: 'Do you see ellipticals available at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('treadmills, elliptical, free weights as no should redirect to stretch', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'no',
      ellipticals: 'no',
      freeweights: 'no',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory:  'gym_stretch',
      message: 'Do you see space to stretch at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('free weights as yes should redirect to bench', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'yes',
      ellipticals: 'no',
      freeweights: 'yes',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory:  'gym_freeweightsbenches',
      message: 'There are treadmills/free weights available at SPAC. Do you see benches to use with free weights at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('stretch mats as no should redirect to rollers', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'yes',
      ellipticals: 'no',
      freeweights: 'yes',
      freeweightsbenches: 'yes',
      freeweightssquatracks: 'yes',
      stretch: 'yes',
      stretchmats: 'no',
      stretchrollers: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory:  'gym_stretchrollers',
      message: 'There are treadmills/free weights with benches and with squat racks/stretching space available at SPAC. Do you see any rollers to use for stretching at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold should return undefined since nothing further can be asked', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'yes',
      ellipticals: 'no',
      freeweights: 'yes',
      freeweightsbenches: 'yes',
      freeweightssquatracks: 'yes',
      stretch: 'yes',
      stretchmats: 'no',
      stretchrollers: 'no'
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = undefined;

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('check fully scaffolded message', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'yes',
      ellipticals: 'no',
      freeweights: 'yes',
      freeweightsbenches: 'yes',
      freeweightssquatracks: 'yes',
      stretch: 'yes',
      stretchmats: 'no',
      stretchrollers: 'yes'
    };

    // generate notification and compare
    let gymNotif = composer.createTextForScaffold(structure.scaffoldStructure, scaffoldData, locationName);
    let expectedOutput = 'There are treadmills/free weights with benches and with squat racks/stretching space with rollers available at SPAC.';

    expect(gymNotif).to.deep.equal(expectedOutput);
  });
});

describe('workspace notification generation', () => {
  // specify overall structure
  let structure = scaffolds.workspaces;
  let locationName = 'Main Library 1South';

  it('empty scaffold should return query only', function () {
    // setup input data
    let scaffoldData = {
      privateseating: '',
      privateseatingoutlets: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      whiteboards: '',
      whiteboardsmarkers: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_privateseating',
      message: 'Do you see private seating (individual tables/chairs) available at Main Library 1South?',
      contextualResponses: ['tables', 'couches/chairs', 'tables and couches/chairs', 'no']
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating as no should redirect to shared seating', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'no',
      privateseatingoutlets: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      whiteboards: '',
      whiteboardsmarkers: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_sharedseating',
      message: 'Do you see shared seating (communal tables) available at Main Library 1South?',
      contextualResponses: [ 'yes', 'no' ]
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating as tables and couches/chairs should redirect to outlets', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'tables and couches/chairs',
      privateseatingoutlets: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      whiteboards: '',
      whiteboardsmarkers: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_privateseatingoutlets',
      message: 'There is private seating (tables and couches/chairs), available at Main Library 1South. Do you see private seating (individual tables/chairs) near outlets at Main Library 1South?',
      contextualResponses: [ 'yes', 'no' ]
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('shared seating yes, outlets no should redirect to whiteboards', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'tables and couches/chairs',
      privateseatingoutlets: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      whiteboards: '',
      whiteboardsmarkers: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_whiteboards',
      message: 'There is private seating (tables and couches/chairs), and also shared seating (communal tables), available at Main Library 1South. Do you see any whiteboards currently available to use at Main Library 1South?',
      contextualResponses: [ 'yes', 'no' ]
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold should return undefined since nothing further can be asked', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'tables and couches/chairs',
      privateseatingoutlets: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      whiteboards: 'yes',
      whiteboardsmarkers: 'no'
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = undefined;

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('check fully scaffolded message', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'tables and couches/chairs',
      privateseatingoutlets: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      whiteboards: 'yes',
      whiteboardsmarkers: 'yes'
    };

    // generate notification and compare
    let workspaceText = composer.createTextForScaffold(structure.scaffoldStructure, scaffoldData, locationName);
    let expectedOutput = 'There is private seating (tables and couches/chairs), and also shared seating (communal tables), and also whiteboards markers to borrow nearby, available at Main Library 1South.';

    expect(workspaceText).to.deep.equal(expectedOutput);
  });
});

describe('freefood notification generation', () => {
  // specify overall structure
  let structure = scaffolds.freefood;
  let locationName = 'Tech Lobby';

  it('empty scaffold should return query only', function () {
    // setup input data
    let scaffoldData = {
      foodtype: '',
      stillleft: ''
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'freefood_foodtype',
      message: 'Do you know what kind of free food is available at Tech Lobby?',
      contextualResponses: ['pizza', 'bagels', 'donuts', 'other']
    };

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });

  it('foodtype pizza should redirect to stillleft', function () {
    // setup input data
    let scaffoldData = {
      foodtype: 'pizza',
      stillleft: ''
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'freefood_stillleft',
      message: 'There is free food (pizza), available at Tech Lobby. Is there still free food left at Tech Lobby?',
      contextualResponses: ['yes', 'no']
    };

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });

  // TODO: when implementing loopback questions, this should return stillleft
  it('full scaffold should return undefined since nothing further can be asked', function () {
    // setup input data
    let scaffoldData = {
      foodtype: 'pizza',
      stillleft: 'yes'
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = undefined;

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });

  it('check fully scaffolded message', function () {
    // setup input data
    let scaffoldData = {
      foodtype: 'pizza',
      stillleft: 'yes'
    };

    // generate notification and compare
    let freeFood = composer.createTextForScaffold(structure.scaffoldStructure, scaffoldData, locationName);
    let expectedOutput = 'There is free food (pizza), available at Tech Lobby.';

    expect(freeFood).to.deep.equal(expectedOutput);
  });
});

// TODO: write proper test cases
describe('retrieving locations for tracking', () => {
  it('opp at location', function () {
    // includeDistance, includeEnRoute, includeWithoutPref, lat, lng, atDistanceNotifDistance, vendorId, response
    return location.fetchLocationsToTrack(false, false, false, 46, 47, 300,
      'C48E4605-3BE6-4DD7-A4AD-608C61104304', undefined).then(result => {
      console.log('\nOpp at Location: \n', result);
      expect('blah').to.deep.equal('hello');
    });
    // // console.log(location.fetchLocationsToTrack(true, true, false, 46, 47, 300, 'C48E4605-3BE6-4DD7-A4AD-608C61104304'));
    // console.log(locations);
  });

  it('4X', function () {
    // includeDistance, includeEnRoute, includeWithoutPref, lat, lng, atDistanceNotifDistance, vendorId, response
    return location.fetchLocationsToTrack(true, true, false, 46, 47, 300,
      'C48E4605-3BE6-4DD7-A4AD-608C61104304', undefined).then(result => {
      console.log('\n4X: \n', result);
      expect('blah').to.deep.equal('hello');
    });
    // // console.log(location.fetchLocationsToTrack(true, true, false, 46, 47, 300, 'C48E4605-3BE6-4DD7-A4AD-608C61104304'));
    // console.log(locations);
  });

  it('opp at distance', function () {
    // includeDistance, includeEnRoute, includeWithoutPref, lat, lng, atDistanceNotifDistance, vendorId, response
    return location.fetchLocationsToTrack(true, false, true, 46, 47, 300,
      'C48E4605-3BE6-4DD7-A4AD-608C61104304', undefined).then(result => {
      console.log('\nOpp at Distance: \n', result);
      expect('blah').to.deep.equal('hello');
    });
    // // console.log(location.fetchLocationsToTrack(true, true, false, 46, 47, 300, 'C48E4605-3BE6-4DD7-A4AD-608C61104304'));
    // console.log(locations);
  });
});