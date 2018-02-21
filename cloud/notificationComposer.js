const _ = require('lodash');

/*
 * Create scaffold data
 */
const coffeeshops = {
  locationType: 'coffeeshop',
  refreshTime: 2 * 60 * 60, // 2 hr * 60 mins/hr * 60 seconds/min
  scaffold: {
    privateseating: '',
    privateseatingoutlets: '',
    privateseatingwindows: '',
    sharedseating: '',
    sharedseatingoutlets: '',
    sharedseatingwindows: ''
  },
  scaffoldStructure: {
    key: '',
    prefixText: 'There is',
    suffixText: ', available at {{locationname}}.',
    joinText: ', and also ',
    components: [
      {
        key: 'privateseating',
        prefixText: 'private seating ({{privateseating}})',
        suffixText: '',
        joinText: ' and ',
        components: [
          {
            key: 'privateseatingoutlets',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'outlets'
          },
          {
            key: 'privateseatingwindows',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'windows'
          }
        ]
      },
      {
        key: 'sharedseating',
        prefixText: 'shared seating (communal tables)',
        suffixText: '',
        joinText: ' and ',
        components: [
          {
            key: 'sharedseatingoutlets',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'outlets'
          },
          {
            key: 'sharedseatingwindows',
            prefixText: 'near',
            suffixText: '',
            joinText: '',
            components: 'windows'
          }
        ]
      }
    ]
  },
  queries: {
    privateseating: 'Do you see private seating (individual tables/chairs) available at {{locationname}}?',
    privateseatingoutlets: 'Do you see private seating for individuals near outlets at {{locationname}}?',
    privateseatingwindows: 'Do you see private seating for individuals near the windows at {{locationname}}?',
    sharedseating: 'Do you see shared seating (communal tables) available at {{locationname}}?',
    sharedseatingoutlets: 'Do you see shared seating (communal tables) near outlets available at {{locationname}}?',
    sharedseatingwindows: 'Do you see shared seating (communal tables) near the windows available at {{locationname}}?',
  },
  queryAnswers: {
    privateseating: ['tables', 'couches/chairs', 'tables and couches/chairs', 'no'],
    privateseatingoutlets: ['yes', 'no'],
    privateseatingwindows: ['yes', 'no'],
    sharedseating: ['yes', 'no'],
    sharedseatingoutlets: ['yes', 'no'],
    sharedseatingwindows: ['yes', 'no']
  },
};

const gyms = {
  locationType: 'gym',
  refreshTime: 2 * 60 * 60, // 2 hr * 60 mins/hr * 60 seconds/min
  scaffold: {
    treadmills: '',
    ellipticals: '',
    freeweights: '',
    freeweightsbenches: '',
    freeweightssquatracks: '',
    stretch: '',
    stretchmats: '',
    stretchrollers: ''
  },
  scaffoldStructure: {
    key: '',
    prefixText: 'There are',
    suffixText: 'available at {{locationname}}.',
    joinText: '/',
    components: [
      {
        key: 'treadmills',
        prefixText: '',
        suffixText: '',
        joinText: '',
        components: 'treadmills'
      },
      {
        key: 'ellipticals',
        prefixText: '',
        suffixText: '',
        joinText: '',
        components: 'ellipticals'
      },
      {
        key: 'freeweights',
        prefixText: 'free weights',
        suffixText: '',
        joinText: ' and ',
        components: [
          {
            key: 'freeweightsbenches',
            prefixText: 'with',
            suffixText: '',
            joinText: '',
            components: 'benches'
          },
          {
            key: 'freeweightssquatracks',
            prefixText: 'with',
            suffixText: '',
            joinText: '',
            components: 'squat racks'
          }
        ]
      },
      {
        key: 'stretch',
        prefixText: 'stretching space',
        suffixText: '',
        joinText: ' and ',
        components: [
          {
            key: 'stretchmats',
            prefixText: 'with',
            suffixText: '',
            joinText: '',
            components: 'mats'
          },
          {
            key: 'stretchrollers',
            prefixText: 'with',
            suffixText: '',
            joinText: '',
            components: 'rollers'
          }
        ]
      },
    ]
  },
  queries: {
    treadmills: 'Do you see treadmills available at {{locationname}}?',
    ellipticals: 'Do you see ellipticals available at {{locationname}}?',
    freeweights: 'Do you see free weights (dumbbells or barbells) available at {{locationname}}?',
    freeweightsbenches: 'Do you see benches to use with free weights at {{locationname}}?',
    freeweightssquatracks: 'Do you see squat racks to use with free weights at {{locationname}}?',
    stretch: 'Do you see space to stretch at {{locationname}}?',
    stretchmats: 'Do you see any mats to use for stretching at {{locationname}}?',
    stretchrollers: 'Do you see any rollers to use for stretching at {{locationname}}?'
  },
  queryAnswers: {
    treadmills: ['yes', 'no'],
    ellipticals: ['yes', 'no'],
    freeweights: ['yes', 'no'],
    freeweightsbenches: ['yes', 'no'],
    freeweightssquatracks: ['yes', 'no'],
    stretch: ['yes', 'no'],
    stretchmats: ['yes', 'no'],
    stretchrollers: ['yes', 'no']
  },
};

/**
 * Creates an object with the notification category, message (data and query) and responses.
 *
 * @param locationMetadata {object} data structure for location
 * @param scaffoldData {object} current data stored in scaffold
 * @param locationName {string} name of location
 * @returns {undefined|{notificationCategory: string, message: string, contextualResponses: array}}
 */
const composeNotification = function (locationMetadata, scaffoldData, locationName) {
  // get current data text
  let dataText = createTextForScaffold(locationMetadata.scaffoldStructure, scaffoldData, locationName);

  // get next query key
  // check if no question is available to ask, return undefined if so
  let queryKey = getNextQueryKey(locationMetadata.scaffoldStructure, scaffoldData);
  if (queryKey === '') {
    return undefined;
  }

  // given valid queryKey, get queryText, and queryAnswers
  let queryText = locationMetadata.queries[queryKey];
  queryText = queryText.replace('{{locationname}}', locationName);
  let queryAnswers = locationMetadata.queryAnswers[queryKey];

  // create full notification message
  let message = (dataText + ' ' + queryText).trim();

  // create notificationCategory
  let notificationCategory = locationMetadata.locationType + '_' + queryKey;

  // create and return output object
  return {
    notificationCategory: notificationCategory, // classtype_questionkey
    message: message, // notification message to present, both with info and query
    contextualResponses: queryAnswers // responses for contextual handler
  };
};

// TODO: add support for loopback questions (e.g. free food --> is it still there?)
/**
 * Determines the next key to query for, based on scaffold structure.
 * If scaffold is full, return ''
 *
 * @param scaffoldStructure {object} structure of scaffold text
 * @param scaffoldData {object} current data stored in scaffold
 * @returns {string}
 */
const getNextQueryKey = function (scaffoldStructure, scaffoldData) {
  // check if key has a value in current info, return if not
  let currKey = scaffoldStructure.key;
  if (currKey !== '' && scaffoldData[currKey] === '') {
    return currKey;
  }

  // recurse through components, stopping if a valid key is found
  // if there is no info for a parent, don't recurse through its children
  let keyCandidate = '';
  _.forEach(scaffoldStructure.components, (currentComponent) => {
    if (scaffoldData[currKey] !== 'no') {
      let recursiveReturn = getNextQueryKey(currentComponent, scaffoldData);
      if (recursiveReturn !== '') {
        keyCandidate = recursiveReturn;
        return false;
      }
    }
  });

  return keyCandidate;
};

// TODO: add preference support to this.
/**
 * Creates text for scaffolded data, given the structure and current data.
 *
 * @param scaffoldStructure {object} structure of scaffold text
 * @param scaffoldData {object} current data stored in scaffold
 * @param locationName {string} name of location
 * @returns {string} scaffolded data text
 */
const createTextForScaffold = function (scaffoldStructure, scaffoldData, locationName) {
  // if key is not valid (blank or no), it (and everything under it) should not be added. return ''
  let currentScaffoldDataForKey = scaffoldData[scaffoldStructure.key];
  if (!(currentScaffoldDataForKey !== 'no' && currentScaffoldDataForKey !== '')) {
    return '';
  }

  // recursive base case: if no component array and scaffold contains data current key,
  // return text with prefix and suffix added
  if (typeof scaffoldStructure.components === 'string') {
      let baseArray = [scaffoldStructure.prefixText,
        scaffoldStructure.components,
        scaffoldStructure.suffixText];
      return baseArray.join(' ').trim();
  }

  // recurse for each component if current key is valid
  let middleComponentArray = [];
  _.forEach(scaffoldStructure.components, (currentComponent) => {
    // add to combinedOutputArray if not blank
    let recursiveReturn = createTextForScaffold(currentComponent, scaffoldData, locationName);
    if (recursiveReturn !== '') {
      middleComponentArray.push(recursiveReturn);
    }
  });

  // check if there is nothing in the middle if key is '' (highest level)
  let middle = middleComponentArray.join(scaffoldStructure.joinText);
  if (scaffoldStructure.key === '' && middle === '') {
    return '';
  }

  // combine with prefix and suffix
  let outputText = [scaffoldStructure.prefixText, middle, scaffoldStructure.suffixText].join(' ').trim();

  // replace any {{key}} with correct text
  if (scaffoldStructure.key === '') { // check highest level for location name
    outputText = outputText.replace('{{locationname}}', locationName);
  } else { // check for current key
    let replacementTarget = '{{' + scaffoldStructure.key + '}}';
    outputText = outputText.replace(replacementTarget, scaffoldData[scaffoldStructure.key]);
  }

  // return text without any extra spaces before punctuation
  return outputText.replace(/\s+([.,!":])/g, '$1');
};

module.exports = {
  composeNotification: composeNotification,
  getNextQueryKey: getNextQueryKey,
  createTextForScaffold: createTextForScaffold,
  coffeeshops: coffeeshops,
  gyms: gyms
};