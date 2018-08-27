const expect = require('chai').expect;
const composer = require('../cloud/notificationComposer');
const scaffolds = require('../init/scaffolds');
const location = require('../cloud/locationFunctions');

const Parse = require('parse/node');
Parse.initialize('PkngqKtJygU9WiQ1GXM9eC0a17tKmioKKmpWftYr');
Parse.serverURL = 'http://localhost:5000/parse/';

/**
 * Coffee Shop Test Cases
 */
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
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_privateseating',
      message: 'Do you see private seating (individual tables) available at Coffee Lab?',
      contextualResponses: ['yes', 'no']
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
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_sharedseating',
      message: 'Do you see shared seating (communal tables) available at Coffee Lab?',
      contextualResponses: ['yes', 'no']
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating (individual tables) should redirect to outlets', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: '',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_privateseatingoutlets',
      message: 'There is private seating (individual tables), available at Coffee Lab. Do you see private seating (individual tables) near outlets at Coffee Lab?',
      contextualResponses: ['yes', 'no']
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating (individual tables) and no outlets should redirect to windows', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_privateseatingwindows',
      message: 'There is private seating (individual tables), available at Coffee Lab. Do you see private seating (individual tables) near the windows at Coffee Lab?',
      contextualResponses: ['yes', 'no']
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('shared seating yes, outlets no should redirect to windows', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_sharedseatingwindows',
      message: 'There is private seating (individual tables), and also shared seating (communal tables), available at Coffee Lab. Do you see shared seating (communal tables) near the windows available at Coffee Lab?',
      contextualResponses: ['yes', 'no']
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold should return still correct loopback question', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'no',
      stillcorrect: ''
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_stillcorrect',
      message: 'There is private seating (individual tables), and also shared seating (communal tables), available at Coffee Lab. Is this information still correct?',
      contextualResponses: ['yes', 'no']
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold with yes to loopback should return loopback', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'no',
      stillcorrect: 'yes'
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_stillcorrect',
      message: 'There is private seating (individual tables), and also shared seating (communal tables), available at Coffee Lab. Is this information still correct?',
      contextualResponses: ['yes', 'no']
    };

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold with no to loopback should return undefined', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'no',
      stillcorrect: 'no'
    };

    // generate notification and compare
    let coffeeshopNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = undefined;

    expect(coffeeshopNotif).to.deep.equal(expectedOutput);
  });

  it('check fully scaffolded message', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'yes',
      privateseatingwindows: 'yes',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'yes',
      stillcorrect: 'no'
    };

    // generate notification and compare
    let coffeeshopText = composer.createTextForScaffold(structure.scaffoldStructure, scaffoldData, locationName);
    let expectedOutput = 'There is private seating (individual tables) near outlets and near windows, and also shared seating (communal tables) near windows, available at Coffee Lab.';

    expect(coffeeshopText).to.deep.equal(expectedOutput);
  });
});

describe('coffee shop scaffold testing', () => {
  // specify overall structure
  let locationName = 'Coffee Lab';
  let locationMetadata = scaffolds.coffeeshops;
  let includeWithoutPref = false;

  it('no data should yield only an atLocationMessage', function () {
    // set all needed variables
    let informationPreferences = {
      privateseating: ['yes'],
      privateseatingoutlets: ['yes'],
      privateseatingwindows: ['yes'],
      sharedseating: ['yes'],
      sharedseatingoutlets: ['yes'],
      sharedseatingwindows: ['yes']
    };
    let locationPreferences = ['Coffee Lab'];
    let scaffoldData = {
      privateseating: '',
      privateseatingoutlets: '',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'coffeeshop_privateseating',
      preferredInfoMessage: '',
      atDistanceMessage: '',
      atDistanceResponses: [],
      atLocationMessage: 'Do you see private seating (individual tables) available at Coffee Lab?',
      atLocationResponses: [ 'yes', 'no', 'I don\'t know' ]
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  it('no to privateseating but yes to privateseatingoutlets should have scaffold present', function () {
    // set all needed variables
    let informationPreferences = {
      privateseating: [],
      privateseatingoutlets: ['yes'],
      privateseatingwindows: ['yes'],
      sharedseating: ['yes'],
      sharedseatingoutlets: ['yes'],
      sharedseatingwindows: ['yes']
    };
    let locationPreferences = ['Coffee Lab'];
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'yes',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'coffeeshop_privateseatingwindows',
      preferredInfoMessage: 'There is private seating (individual tables) near outlets, available at Coffee Lab.',
      atLocationMessage: 'There is private seating (individual tables) near outlets, available at Coffee Lab. Do you see private seating (individual tables) near the windows at Coffee Lab?'
    };

    expect(composedNotification.notificationCategory).to.equal(expectedOutput.notificationCategory);
    expect(composedNotification.preferredInfoMessage).to.equal(expectedOutput.preferredInfoMessage);
    expect(composedNotification.atLocationMessage).to.equal(expectedOutput.atLocationMessage);
  });

  it('full info with limited preferences should only contain info user wants', function () {
    // set all needed variables
    let informationPreferences = {
      privateseating: [],
      privateseatingoutlets: ['yes'],
      privateseatingwindows: [],
      sharedseating: ['yes'],
      sharedseatingoutlets: [],
      sharedseatingwindows: ['yes']
    };
    let locationPreferences = ['Coffee Lab'];
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'yes',
      privateseatingwindows: 'yes',
      sharedseating: 'yes',
      sharedseatingoutlets: 'yes',
      sharedseatingwindows: 'yes',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'coffeeshop_stillcorrect',
      preferredInfoMessage: 'There is private seating (individual tables) near outlets, and also shared seating (communal tables) near windows, available at Coffee Lab.',
      atLocationMessage: 'There is private seating (individual tables) near outlets and near windows, and also shared seating (communal tables) near outlets and near windows, available at Coffee Lab. Is this information still correct?'
    };

    expect(composedNotification.notificationCategory).to.equal(expectedOutput.notificationCategory);
    expect(composedNotification.preferredInfoMessage).to.equal(expectedOutput.preferredInfoMessage);
    expect(composedNotification.atLocationMessage).to.equal(expectedOutput.atLocationMessage);
  });

  it('dont include if user doesnt have location in preferences, regardless of other prefs and info', function () {
    // set all needed variables
    let informationPreferences = {
      privateseating: ['yes'],
      privateseatingoutlets: ['yes'],
      privateseatingwindows: ['yes'],
      sharedseating: ['yes'],
      sharedseatingoutlets: ['yes'],
      sharedseatingwindows: ['yes']
    };
    let locationPreferences = [];
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'yes',
      privateseatingwindows: 'yes',
      sharedseating: 'yes',
      sharedseatingoutlets: 'yes',
      sharedseatingwindows: 'yes',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'coffeeshop_stillcorrect',
      preferredInfoMessage: '',
      atDistanceMessage: '',
      atDistanceResponses: [],
      atLocationMessage: 'There is private seating (individual tables) near outlets and near windows, and also shared seating (communal tables) near outlets and near windows, available at Coffee Lab. Is this information still correct?',
      atLocationResponses: [ 'yes', 'no', 'I don\'t know' ]
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });
});

/**
* Gym Test Cases
*/
describe('gym notification generation', () => {
  // specify overall structure
  let structure = scaffolds.gyms;
  let locationName = 'SPAC';

  it('empty scaffold should return query only', function () {
    // setup input data
    let scaffoldData = {
      treadmills: '',
      freeweights: '',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_treadmills',
      message: 'Do you see treadmills available at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('treadmills as no should redirect to freeweights', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'no',
      freeweights: '',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_freeweights',
      message: 'Do you see free weights (dumbbells or barbells) available at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('treadmills, free weights as no should redirect to stretch', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'no',
      freeweights: 'no',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_stretch',
      message: 'Do you see space to stretch at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('free weights as yes should redirect to bench', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'yes',
      freeweights: 'yes',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_freeweightsbenches',
      message: 'There are treadmills/free weights available at SPAC. Do you see benches to use with free weights at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('stretch mats as no should redirect to rollers', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'yes',
      freeweights: 'yes',
      freeweightsbenches: 'yes',
      freeweightssquatracks: 'yes',
      stretch: 'yes',
      stretchmats: 'no',
      stretchrollers: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_stretchrollers',
      message: 'There are treadmills/free weights with benches and with squat racks/stretching space available at SPAC. Do you see any rollers to use for stretching at SPAC?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold should return still correct loopback question', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'yes',
      freeweights: 'yes',
      freeweightsbenches: 'yes',
      freeweightssquatracks: 'yes',
      stretch: 'yes',
      stretchmats: 'no',
      stretchrollers: 'no',
      stillcorrect: ''
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_stillcorrect',
      message: 'There are treadmills/free weights with benches and with squat racks/stretching space available at SPAC. Is this information still correct?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold with yes to loopback should return loopback', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'yes',
      freeweights: 'yes',
      freeweightsbenches: 'yes',
      freeweightssquatracks: 'yes',
      stretch: 'yes',
      stretchmats: 'no',
      stretchrollers: 'no',
      stillcorrect: 'yes'
    };

    // generate notification and compare
    let gymNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_stillcorrect',
      message: 'There are treadmills/free weights with benches and with squat racks/stretching space available at SPAC. Is this information still correct?',
      contextualResponses: ['yes', 'no']
    };

    expect(gymNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold with no to loopback should return undefined', function () {
    // setup input data
    let scaffoldData = {
      treadmills: 'yes',
      freeweights: 'yes',
      freeweightsbenches: 'yes',
      freeweightssquatracks: 'yes',
      stretch: 'yes',
      stretchmats: 'no',
      stretchrollers: 'no',
      stillcorrect: 'no'
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
      stretchrollers: 'yes',
      stillcorrect: 'no'
    };

    // generate notification and compare
    let gymNotif = composer.createTextForScaffold(structure.scaffoldStructure, scaffoldData, locationName);
    let expectedOutput = 'There are treadmills/free weights with benches and with squat racks/stretching space with rollers available at SPAC.';

    expect(gymNotif).to.deep.equal(expectedOutput);
  });
});

describe('gym scaffold testing', () => {
  // specify overall structure
  let locationName = 'SPAC';
  let locationMetadata = scaffolds.gyms;
  let includeWithoutPref = false;

  it('no data should yield only an atLocationMessage', function () {
    let informationPreferences = {
      treadmills: ['yes'],
      freeweights: ['yes'],
      freeweightsbenches: [],
      freeweightssquatracks: ['yes'],
      stretch: [],
      stretchmats: [],
      stretchrollers: ['yes'],
      stillcorrect: []
    };
    let locationPreferences = ['SPAC'];
    let scaffoldData = {
      treadmills: '',
      freeweights: '',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_treadmills',
      preferredInfoMessage: '',
      atDistanceMessage: '',
      atDistanceResponses: [],
      atLocationMessage: 'Do you see treadmills available at SPAC?',
      atLocationResponses: [ 'yes', 'no', 'I don\'t know' ]
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  it('yes to benches but no data should not give benches', function () {
    let informationPreferences = {
      treadmills: ['yes'],
      freeweights: ['yes'],
      freeweightsbenches: [],
      freeweightssquatracks: ['yes'],
      stretch: [],
      stretchmats: [],
      stretchrollers: ['yes'],
      stillcorrect: []
    };
    let locationPreferences = ['SPAC'];
    let scaffoldData = {
      treadmills: 'yes',
      freeweights: 'no',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: '',
      stretchmats: '',
      stretchrollers: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_stretch',
      preferredInfoMessage: 'There are treadmills available at SPAC.',
      atDistanceMessage: 'There are treadmills available at SPAC. Would you like to go there?',
      atDistanceResponses: ['Yes! This info is useful. I\'m going to go there.',
        'Yes. This info is useful but I\'m already going there.',
        'No. This info is useful, but I can\'t go there now.',
        'No. This info isn\'t useful to me.',
        'No. Other reason.'],
      atLocationMessage: 'There are treadmills available at SPAC. Do you see space to stretch at SPAC?',
      atLocationResponses: [ 'yes', 'no', 'I don\'t know' ]
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  it('full info with limited preferences should only contain info user wants', function () {
    let informationPreferences = {
      treadmills: ['yes'],
      freeweights: ['yes'],
      freeweightsbenches: [],
      freeweightssquatracks: ['yes'],
      stretch: [],
      stretchmats: [],
      stretchrollers: ['yes'],
      stillcorrect: []
    };
    let locationPreferences = ['SPAC'];
    let scaffoldData = {
      treadmills: 'yes',
      freeweights: 'no',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: 'yes',
      stretchmats: 'yes',
      stretchrollers: 'yes',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_stillcorrect',
      preferredInfoMessage: 'There are treadmills/stretching space with rollers available at SPAC.',
      atDistanceMessage: 'There are treadmills/stretching space with rollers available at SPAC. Would you like to go there?',
      atDistanceResponses: ['Yes! This info is useful. I\'m going to go there.',
        'Yes. This info is useful but I\'m already going there.',
        'No. This info is useful, but I can\'t go there now.',
        'No. This info isn\'t useful to me.',
        'No. Other reason.'],
      atLocationMessage: 'There are treadmills/stretching space with mats and with rollers available at SPAC. Is this information still correct?',
      atLocationResponses: [ 'yes', 'no', 'I don\'t know' ]
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  it('dont include if user doesnt have location in preferences, regardless of other prefs and info', function () {
    let informationPreferences = {
      treadmills: ['yes'],
      freeweights: ['yes'],
      freeweightsbenches: [],
      freeweightssquatracks: ['yes'],
      stretch: [],
      stretchmats: [],
      stretchrollers: ['yes'],
      stillcorrect: []
    };
    let locationPreferences = [];
    let scaffoldData = {
      treadmills: 'yes',
      freeweights: 'no',
      freeweightsbenches: '',
      freeweightssquatracks: '',
      stretch: 'yes',
      stretchmats: 'yes',
      stretchrollers: 'yes',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'gym_stillcorrect',
      preferredInfoMessage: '',
      atDistanceMessage: '',
      atDistanceResponses: [],
      atLocationMessage: 'There are treadmills/stretching space with mats and with rollers available at SPAC. Is this information still correct?',
      atLocationResponses: ['yes', 'no', 'I don\'t know']
    };


    expect(composedNotification).to.deep.equal(expectedOutput);
  });
});

/**
 * Workspaces Test Cases
 */
describe('workspace notification generation', () => {
  // specify overall structure
  let structure = scaffolds.workspaces;
  let locationName = 'Main Library 1South';

  it('empty scaffold should return query only', function () {
    // setup input data
    let scaffoldData = {
      privateseating: '',
      privateseatingoutlets: '',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_privateseating',
      message: 'Do you see private seating (individual tables) available at Main Library 1South?',
      contextualResponses: ['yes', 'no']
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating as no should redirect to shared seating', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'no',
      privateseatingoutlets: '',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_sharedseating',
      message: 'Do you see shared seating (communal tables) available at Main Library 1South?',
      contextualResponses: ['yes', 'no']
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating (individual tables) should redirect to outlets', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: '',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_privateseatingoutlets',
      message: 'There is private seating (individual tables), available at Main Library 1South. Do you see private seating (individual tables) near outlets at Main Library 1South?',
      contextualResponses: ['yes', 'no']
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('privateseating (individual tables) and no outlets should redirect to windows', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_privateseatingwindows',
      message: 'There is private seating (individual tables), available at Main Library 1South. Do you see private seating (individual tables) near the windows at Main Library 1South?',
      contextualResponses: ['yes', 'no']
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('shared seating yes, outlets no should redirect to windows', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_sharedseatingwindows',
      message: 'There is private seating (individual tables), and also shared seating (communal tables), available at Main Library 1South. Do you see shared seating (communal tables) near the windows available at Main Library 1South?',
      contextualResponses: ['yes', 'no']
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold should return still correct loopback question', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'no',
      stillcorrect: ''
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_stillcorrect',
      message: 'There is private seating (individual tables), and also shared seating (communal tables), available at Main Library 1South. Is this information still correct?',
      contextualResponses: ['yes', 'no']
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold with yes to loopback should return loopback', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'no',
      stillcorrect: 'yes'
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_stillcorrect',
      message: 'There is private seating (individual tables), and also shared seating (communal tables), available at Main Library 1South. Is this information still correct?',
      contextualResponses: ['yes', 'no']
    };

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold with no to loopback should return undefined', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'no',
      privateseatingwindows: 'no',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'no',
      stillcorrect: 'no'
    };

    // generate notification and compare
    let workspaceNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = undefined;

    expect(workspaceNotif).to.deep.equal(expectedOutput);
  });

  it('check fully scaffolded message', function () {
    // setup input data
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'yes',
      privateseatingwindows: 'yes',
      sharedseating: 'yes',
      sharedseatingoutlets: 'no',
      sharedseatingwindows: 'yes',
      stillcorrect: 'no'
    };

    // generate notification and compare
    let workspaceText = composer.createTextForScaffold(structure.scaffoldStructure, scaffoldData, locationName);
    let expectedOutput = 'There is private seating (individual tables) near outlets and near windows, and also shared seating (communal tables) near windows, available at Main Library 1South.';

    expect(workspaceText).to.deep.equal(expectedOutput);
  });
});

describe('workspace scaffold testing', () => {
  // specify overall structure
  let locationName = 'Main 1South';
  let locationMetadata = scaffolds.workspaces;
  let includeWithoutPref = false;

  it('no data should yield only an atLocationMessage', function () {
    // set all needed variables
    let informationPreferences = {
      privateseating: ['yes'],
      privateseatingoutlets: ['yes'],
      privateseatingwindows: ['yes'],
      sharedseating: ['yes'],
      sharedseatingoutlets: ['yes'],
      sharedseatingwindows: ['yes']
    };
    let locationPreferences = ['Main 1South', 'Mudd Common Area (outside library)'];
    let scaffoldData = {
      privateseating: '',
      privateseatingoutlets: '',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'workspace_privateseating',
      preferredInfoMessage: '',
      atDistanceMessage: '',
      atDistanceResponses: [],
      atLocationMessage: 'Do you see private seating (individual tables) available at Main 1South?',
      atLocationResponses: [ 'yes', 'no', 'I don\'t know' ]
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  it('no to privateseating but yes to privateseatingoutlets should have scaffold present', function () {
    // set all needed variables
    let informationPreferences = {
      privateseating: [],
      privateseatingoutlets: ['yes'],
      privateseatingwindows: ['yes'],
      sharedseating: ['yes'],
      sharedseatingoutlets: ['yes'],
      sharedseatingwindows: ['yes']
    };
    let locationPreferences = ['Main 1South', 'Mudd Common Area (outside library)'];
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'yes',
      privateseatingwindows: '',
      sharedseating: '',
      sharedseatingoutlets: '',
      sharedseatingwindows: '',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'workspace_privateseatingwindows',
      preferredInfoMessage: 'There is private seating (individual tables) near outlets, available at Main 1South.',
      atLocationMessage: 'There is private seating (individual tables) near outlets, available at Main 1South. Do you see private seating (individual tables) near the windows at Main 1South?'
    };

    expect(composedNotification.notificationCategory).to.equal(expectedOutput.notificationCategory);
    expect(composedNotification.preferredInfoMessage).to.equal(expectedOutput.preferredInfoMessage);
    expect(composedNotification.atLocationMessage).to.equal(expectedOutput.atLocationMessage);
  });

  it('full info with limited preferences should only contain info user wants', function () {
    // set all needed variables
    let informationPreferences = {
      privateseating: [],
      privateseatingoutlets: ['yes'],
      privateseatingwindows: [],
      sharedseating: ['yes'],
      sharedseatingoutlets: [],
      sharedseatingwindows: ['yes']
    };
    let locationPreferences = ['Main 1South', 'Mudd Common Area (outside library)'];
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'yes',
      privateseatingwindows: 'yes',
      sharedseating: 'yes',
      sharedseatingoutlets: 'yes',
      sharedseatingwindows: 'yes',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'workspace_stillcorrect',
      preferredInfoMessage: 'There is private seating (individual tables) near outlets, and also shared seating (communal tables) near windows, available at Main 1South.',
      atLocationMessage: 'There is private seating (individual tables) near outlets and near windows, and also shared seating (communal tables) near outlets and near windows, available at Main 1South. Is this information still correct?'
    };

    expect(composedNotification.notificationCategory).to.equal(expectedOutput.notificationCategory);
    expect(composedNotification.preferredInfoMessage).to.equal(expectedOutput.preferredInfoMessage);
    expect(composedNotification.atLocationMessage).to.equal(expectedOutput.atLocationMessage);
  });

  it('dont include if user doesnt have location in preferences, regardless of other prefs and info', function () {
    // set all needed variables
    let informationPreferences = {
      privateseating: ['yes'],
      privateseatingoutlets: ['yes'],
      privateseatingwindows: ['yes'],
      sharedseating: ['yes'],
      sharedseatingoutlets: ['yes'],
      sharedseatingwindows: ['yes']
    };
    let locationPreferences = ['Mudd Common Area (outside library)'];
    let scaffoldData = {
      privateseating: 'yes',
      privateseatingoutlets: 'yes',
      privateseatingwindows: 'yes',
      sharedseating: 'yes',
      sharedseatingoutlets: 'yes',
      sharedseatingwindows: 'yes',
      stillcorrect: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'workspace_stillcorrect',
      preferredInfoMessage: '',
      atDistanceMessage: '',
      atDistanceResponses: [],
      atLocationMessage: 'There is private seating (individual tables) near outlets and near windows, and also shared seating (communal tables) near outlets and near windows, available at Main 1South. Is this information still correct?',
      atLocationResponses: [ 'yes', 'no', 'I don\'t know' ]
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });
});

/**
 * Free Food Test Cases
 */
describe('freefood notification generation', () => {
  // specify overall structure
  let structure = scaffolds.freefood;
  let locationName = 'Tech Lobby';

  it('empty scaffold should return kind food query', function () {
    // setup input data
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: '',
      specificfood: '',
      typefood: '',
      stillleft: ''
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'freefood_kindfood',
      message: 'There is free food available at Tech Lobby. What kind free food is in Tech Lobby?',
      contextualResponses: ['savory', 'sweet']
    };

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });

  it('savory food should show savory options', function () {
    // setup input data
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: 'savory',
      specificfood: '',
      typefood: '',
      stillleft: ''
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'freefood_specificfood',
      message: 'There is free food (savory snacks) available at Tech Lobby. What specifically is the savory food in Tech Lobby?',
      contextualResponses: ['pizza', 'bags of nuts/chips']
    };

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });

  it('savory food pizza should show pizza flavor options', function () {
    // setup input data
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: 'savory',
      specificfood: 'pizza',
      typefood: '',
      stillleft: ''
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'freefood_typefood',
      message: 'There is free food (savory snacks: pizza) available at Tech Lobby. What type of pizza is in Tech Lobby?',
      contextualResponses: ['cheese', 'pepperoni']
    };

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });

  it('sweet food pizza should show sweet options', function () {
    // setup input data
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: 'sweet',
      specificfood: '',
      typefood: '',
      stillleft: ''
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'freefood_specificfood',
      message: 'There is free food (sweet snacks) available at Tech Lobby. What specifically is the sweet food in Tech Lobby?',
      contextualResponses: [ 'ice cream', 'popsicles', 'candy' ]
    };

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold should return still left loopback question', function () {
    // setup input data
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: 'savory',
      specificfood: 'pizza',
      typefood: 'cheese',
      stillleft: ''
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'freefood_stillleft',
      message: 'There is free food (savory snacks: pizza of cheese flavor) available at Tech Lobby. Is there still free food left in Tech Lobby?',
      contextualResponses: [ 'yes', 'no' ]
    };

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold with yes to loopback should return loopback', function () {
    // setup input data
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: 'savory',
      specificfood: 'pizza',
      typefood: 'cheese',
      stillleft: 'yes'
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);

    let expectedOutput = {
      notificationCategory: 'freefood_stillleft',
      message: 'There is free food (savory snacks: pizza of cheese flavor) available at Tech Lobby. Is there still free food left in Tech Lobby?',
      contextualResponses: [ 'yes', 'no' ]
    };

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });

  it('full scaffold with no to loopback should return undefined', function () {
    // setup input data
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: 'savory',
      specificfood: 'pizza',
      typefood: 'cheese',
      stillleft: 'no'
    };

    // generate notification and compare
    let freefoodNotif = composer.composeNotification(structure, scaffoldData, locationName);

    let expectedOutput = undefined;

    expect(freefoodNotif).to.deep.equal(expectedOutput);
  });
});

describe('freefood scaffold testing', () => {
  // specify overall structure
  let locationName = 'Tech Lobby';
  let locationMetadata = scaffolds.freefood;
  let includeWithoutPref = false;

  it('no data should still notify at distance if user prefers it', function () {
    // set all needed variables
    let informationPreferences = {
      foodevent: ['yes'],
      kindfood: ['sweet'],
      specificfood: ['pizza', 'ice cream'],
      typefood: ['cheese', 'chocolate bar', 'fruit snacks'],
      stillleft: ''
    };
    let locationPreferences = [];
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: '',
      specificfood: '',
      typefood: '',
      stillleft: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'freefood_kindfood',
      preferredInfoMessage: 'There is free food available at Tech Lobby.',
      atDistanceMessage: 'There is free food available at Tech Lobby. Would you like to go there?',
      atDistanceResponses: ['Yes! This info is useful. I\'m going to go there.',
        'Yes. This info is useful but I\'m already going there.',
        'No. This info is useful, but I can\'t go there now.',
        'No. This info isn\'t useful to me.',
        'No. Other reason.'],
      atLocationMessage: 'There is free food available at Tech Lobby. What kind free food is in Tech Lobby?',
      atLocationResponses: [ 'savory', 'sweet', 'I don\'t know' ]
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  it('no data should not notify at distance if user doesnt prefers it', function () {
    // set all needed variables
    let informationPreferences = {
      foodevent: [],
      kindfood: ['sweet'],
      specificfood: ['pizza', 'ice cream'],
      typefood: ['cheese', 'chocolate bar', 'fruit snacks'],
      stillleft: ''
    };
    let locationPreferences = [];
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: '',
      specificfood: '',
      typefood: '',
      stillleft: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'freefood_kindfood',
      preferredInfoMessage: '',
      atDistanceMessage: '',
      atDistanceResponses: [],
      atLocationMessage: 'There is free food available at Tech Lobby. What kind free food is in Tech Lobby?',
      atLocationResponses: [ 'savory', 'sweet', 'I don\'t know' ]
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  it('data is savory but user only prefers sweet', function () {
    // set all needed variables
    let informationPreferences = {
      foodevent: [],
      kindfood: ['sweet'],
      specificfood: ['pizza', 'ice cream'],
      typefood: ['cheese', 'chocolate bar', 'fruit snacks'],
      stillleft: ''
    };
    let locationPreferences = [];
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: 'savory',
      specificfood: '',
      typefood: '',
      stillleft: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'freefood_specificfood',
      preferredInfoMessage: '',
      atDistanceMessage: '',
      atDistanceResponses: [],
      atLocationMessage: 'There is free food (savory snacks) available at Tech Lobby. What specifically is the savory food in Tech Lobby?',
      atLocationResponses: ['pizza', 'bags of nuts/chips', 'I don\'t know']
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  it('user prefers only chocolate ice cream (recursive filling)', function () {
    // set all needed variables
    let informationPreferences = {
      foodevent: [],
      kindfood: [],
      specificfood: ['pizza'],
      typefood: ['cheese', 'chocolate', 'chocolate bar', 'fruit snacks'],
      stillleft: ''
    };
    let locationPreferences = [];
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: 'sweet',
      specificfood: 'ice cream',
      typefood: 'chocolate',
      stillleft: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'freefood_stillleft',
      preferredInfoMessage: 'There is free food (sweet snacks: ice cream of chocolate flavor) available at Tech Lobby.',
      atDistanceMessage: 'There is free food (sweet snacks: ice cream of chocolate flavor) available at Tech Lobby. Would you like to go there?',
      atDistanceResponses: [ 'Yes! This info is useful. I\'m going to go there.',
        'Yes. This info is useful but I\'m already going there.',
        'No. This info is useful, but I can\'t go there now.',
        'No. This info isn\'t useful to me.',
        'No. Other reason.' ],
      atLocationMessage: 'There is free food (sweet snacks: ice cream of chocolate flavor) available at Tech Lobby. Is there still free food left in Tech Lobby?',
      atLocationResponses: ['yes', 'no', 'I don\'t know']
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  it('full info with limited preferences should only contain info user wants', function () {
    // set all needed variables
    let informationPreferences = {
      foodevent: [],
      kindfood: ['sweet'],
      specificfood: ['pizza', 'ice cream'],
      typefood: ['cheese', 'chocolate bar', 'fruit snacks'],
      stillleft: ''
    };
    let locationPreferences = [];
    let scaffoldData = {
      foodevent: 'yes',
      kindfood: 'sweet',
      specificfood: 'ice cream',
      typefood: 'vanilla',
      stillleft: ''
    };

    // generate notification and compare
    let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
      locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
    let expectedOutput = {
      notificationCategory: 'freefood_stillleft',
      preferredInfoMessage: 'There is free food (sweet snacks: ice cream) available at Tech Lobby.',
      atDistanceMessage: 'There is free food (sweet snacks: ice cream) available at Tech Lobby. Would you like to go there?',
      atDistanceResponses: [ 'Yes! This info is useful. I\'m going to go there.',
        'Yes. This info is useful but I\'m already going there.',
        'No. This info is useful, but I can\'t go there now.',
        'No. This info isn\'t useful to me.',
        'No. Other reason.' ],
      atLocationMessage: 'There is free food (sweet snacks: ice cream of vanilla flavor) available at Tech Lobby. Is there still free food left in Tech Lobby?',
      atLocationResponses: ['yes', 'no', 'I don\'t know']
    };

    expect(composedNotification).to.deep.equal(expectedOutput);
  });

  // TODO: think about whether we want this test case to pass
  // it('user prefers earlier data, but not specific info', function () {
  //   // set all needed variables
  //   let informationPreferences = {
  //     foodevent: ['yes'],
  //     kindfood: ['sweet'],
  //     specificfood: ['pizza', 'candy'],
  //     typefood: ['cheese', 'chocolate', 'chocolate bar', 'fruit snacks'],
  //     stillleft: ''
  //   };
  //   let locationPreferences = [];
  //   let scaffoldData = {
  //     foodevent: 'yes',
  //     kindfood: 'sweet',
  //     specificfood: 'ice cream',
  //     typefood: '',
  //     stillleft: ''
  //   };
  //
  //   // generate notification and compare
  //   let composedNotification = composer.createNotificationWithPreferences(informationPreferences,
  //     locationPreferences, includeWithoutPref, locationMetadata, scaffoldData, locationName);
  //   let expectedOutput = {
  //     notificationCategory: 'freefood_typefood',
  //     preferredInfoMessage: '',
  //     atDistanceMessage: '',
  //     atDistanceResponses: [],
  //     atLocationMessage: 'There is free food (sweet snacks: ice cream) available at Tech Lobby. What type of ice cream is in Tech Lobby?',
  //     atLocationResponses: ['chocolate', 'vanilla', 'I don\'t know']
  //   };
  //
  //   expect(composedNotification).to.deep.equal(expectedOutput);
  // });
});

// TODO: write proper test cases
/**
 * Location Retrieving Test Cases
 */
describe('retrieving locations for tracking', () => {
  // it('opp at location', function () {
  //   // includeDistance, includeEnRoute, includeWithoutPref, lat, lng, atDistanceNotifDistance, vendorId, response
  //   return location.fetchLocationsToTrack(false, false, false, 46, 47, 300,
  //     'C48E4605-3BE6-4DD7-A4AD-608C61104304', undefined).then(result => {
  //     console.log('\nOpp at Location: \n', result);
  //     expect('blah').to.deep.equal('hello');
  //   });
  //   // // console.log(location.fetchLocationsToTrack(true, true, false, 46, 47, 300, 'C48E4605-3BE6-4DD7-A4AD-608C61104304'));
  //   // console.log(locations);
  // });

  // it('opp at distance', function () {
  //   // includeDistance, includeEnRoute, includeWithoutPref, lat, lng, atDistanceNotifDistance, vendorId, response
  //   return location.fetchLocationsToTrack(true, false, true, 46, 47, 300,
  //     'C48E4605-3BE6-4DD7-A4AD-608C61104304', undefined).then(result => {
  //     console.log('\nOpp at Distance: \n', result);
  //     expect('blah').to.deep.equal('hello');
  //   });
  //   // // console.log(location.fetchLocationsToTrack(true, true, false, 46, 47, 300, 'C48E4605-3BE6-4DD7-A4AD-608C61104304'));
  //   // console.log(locations);
  // });

  // it('4X', function (done) {
  //   // includeDistance, includeEnRoute, includeWithoutPref, lat, lng, atDistanceNotifDistance, vendorId, response
  //   const fetchedLocations = location.fetchLocationsToTrack(true, true, false, 46, 47, 300,
  //     'C48E4605-3BE6-4DD7-A4AD-608C61104304', undefined).then(result => {
  //     console.log(result);
  //
  //     expect('blah').to.deep.equal('hello');
  //     done();
  //   }).catch(error => {
  //     done(error);
  //   });
  // });
});