const expect = require('chai').expect;
const composer = require('../cloud/notificationComposer.js');

describe('coffee shop composition', () => {
  // specify overall structure
  let structure = composer.coffeeshops;
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
      message: 'There is private seating (tables and couches/chairs), available at Coffee Lab. Do you see private seating for individuals near outlets at Coffee Lab?',
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
      message: 'There is private seating (tables and couches/chairs), available at Coffee Lab. Do you see private seating for individuals near the windows at Coffee Lab?',
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