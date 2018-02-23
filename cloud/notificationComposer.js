const _ = require('lodash');
const moment = require('moment');

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
      let baseOutputText = baseArray.join(' ').trim();

      // replace any {{key}}
      let replacementTarget = '{{' + scaffoldStructure.key + '}}';
      baseOutputText = baseOutputText.replace(replacementTarget, scaffoldData[scaffoldStructure.key]);
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
  createTextForScaffold: createTextForScaffold
};