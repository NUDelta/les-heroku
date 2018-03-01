const _ = require('lodash');
const moment = require('moment');

const atDistanceInfoResponses = [
  'Yes! This info is useful, I\'m going now.',
  'Yes. This info is useful but I\'m already going there.',
  'No. This info is useful but I have to be somewhere.',
  'No. This info isn\'t useful to me.',
  'No. Other reason.'
];

const atDistanceNoInfoResponses = [
  'Sure! I would be happy to go out of my way!',
  'Sure, but I was going to walk past it anyway.',
  'No. I don\'t want to go out of my way there.',
  'No. Other reason.'
];

/**
 * Creates an notification object, given user preferences for the location.
 * Object contains: notificationCategory, preferredInfoMessage,
 * atDistanceMessage, atDistanceResponses, atLocationMessage, and atLocationResponses
 *
 * @param preferences
 * @param includeWithoutPref
 * @param locationMetadata
 * @param scaffoldData
 * @param locationName
 * @returns {object}
 */
const createNotifcationWithPreferences = function (preferences, includeWithoutPref,
                                                   locationMetadata, scaffoldData, locationName) {
  // only use scaffold data where data matches preferences
  const preferredScaffoldData = JSON.parse(JSON.stringify(scaffoldData));
  _.forEach(preferences, (answerList, questionKey) => {
    if (!answerList.includes(scaffoldData[questionKey])) {
      preferredScaffoldData[questionKey] = '';
    }
  });

  // create atDistance message using preferred data
  const atDistanceMessage = createTextForScaffold(locationMetadata.scaffoldStructure,
    preferredScaffoldData, locationName);

  // create atLocation message if no preferences are specified (e.g. atDistanceMessage is blank
  let atLocationMessage = atDistanceMessage;
  if (atLocationMessage === '') {
    atLocationMessage = createTextForScaffold(locationMetadata.scaffoldStructure,
      scaffoldData, locationName);
  }

  // get next query key: check if no question is available to ask, return undefined if so
  let queryKey = getNextQueryKey(locationMetadata.scaffoldStructure, scaffoldData);
  if (queryKey === '') {
    // check if a loopback question is specified and positive value in scaffoldData
    if (locationMetadata.loopbackQuestion !== '' &&
      scaffoldData[locationMetadata.loopbackQuestion] !== 'no') {
      queryKey = locationMetadata.loopbackQuestion;
    } else {
      return undefined;
    }
  }

  // if valid query key, get text and answers (also add idk response to answers)
  let queryText = locationMetadata.queries[queryKey];
  queryText = queryText.replace('{{locationname}}', locationName);
  let queryAnswers = locationMetadata.queryAnswers[queryKey];
  queryAnswers.push('I don\'t know');

  // create notificationCategory
  let notificationCategory = locationMetadata.locationType + '_' + queryKey;

  // create fullAtDistanceMessage and atDistanceResponses
  // if includeWithoutPref is specified (for opp at dist), just ask for info
  let fullAtDistanceMessage = '';
  let atDistanceResponses = [];

  if (includeWithoutPref && atDistanceMessage === '') {
    // special case for freefood
    if (locationMetadata.locationType == 'freefood') {
      fullAtDistanceMessage = 'We need some information about free food at ' + locationName +
        ' nearby. Would you be willing to head over and answer a question for us?';
    } else {
      fullAtDistanceMessage = 'We need some information about ' + locationName +
        ' nearby. Would you be willing to head over and answer a question for us?';
    }

    atDistanceResponses = atDistanceNoInfoResponses;
  } else if (atDistanceMessage !== '') {
    fullAtDistanceMessage = (atDistanceMessage + ' Would you like to go there?');
    atDistanceResponses = atDistanceInfoResponses;
  }

  // create fullAtLocationMessage
  let fullAtLocationMessage = (atLocationMessage + ' ' + queryText).trim();

  // create and return output
  return {
    notificationCategory: notificationCategory,
    preferredInfoMessage: atDistanceMessage,
    atDistanceMessage: fullAtDistanceMessage,
    atDistanceResponses: atDistanceResponses,
    atLocationMessage: fullAtLocationMessage,
    atLocationResponses: queryAnswers
  }
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
    // check if a loopback question is specified and positive value in scaffoldData
    if (locationMetadata.loopbackQuestion !== '' &&
        scaffoldData[locationMetadata.loopbackQuestion] !== 'no') {
      queryKey = locationMetadata.loopbackQuestion;
    } else {
      return undefined;
    }
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
    let baseOutputText = baseArray.join(' ').trim();

    // replace any {{key}}
    let replacementTarget = '{{' + scaffoldStructure.key + '}}';
    baseOutputText = baseOutputText.replace(replacementTarget,
      scaffoldData[scaffoldStructure.key]);
    return baseOutputText;
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
  let outputText = [scaffoldStructure.prefixText, middle, scaffoldStructure.suffixText];
  outputText = outputText.join(' ').trim();

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
  getNextQueryKey: getNextQueryKey,
  createTextForScaffold: createTextForScaffold,
  composeNotification: composeNotification,
  createNotifcationWithPreferences: createNotifcationWithPreferences
};