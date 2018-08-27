const _ = require('lodash');
const moment = require('moment');

const atDistanceInfoResponses = [
  'Yes! This info is useful. I\'m going to go there.',
  'Yes. This info is useful but I\'m already going there.',
  'No. This info is useful, but I can\'t go there now.',
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
 * @param informationPreferences
 * @param locationPreferences
 * @param includeWithoutPref
 * @param locationMetadata
 * @param scaffoldData
 * @param locationName
 * @returns {object}
 */
const createNotificationWithPreferences = function (informationPreferences, locationPreferences,
                                                    includeWithoutPref, locationMetadata,
                                                    scaffoldData, locationName) {
  // check if user wants to be notified about this location
  // special case for free food -> don't check
  let shouldIncludeData = true;
  if (locationMetadata.locationType !== 'freefood') {
    if (!locationPreferences.includes(locationName)) {
      shouldIncludeData = false;
    }
  }

  // only use scaffold data where data matches preferences
  const preferredScaffoldData = JSON.parse(JSON.stringify(scaffoldData));
  _.forEach(informationPreferences, (answerList, questionKey) => {
    // mark data as blank if either answerList doenst have it or user doesnt have location in prefs
    if (!answerList.includes(scaffoldData[questionKey]) || !shouldIncludeData) {
      preferredScaffoldData[questionKey] = '';
    }
  });


  // check if a child has valid preferred data. if so, recursively backfill as needed.
  const backfilledInfo = backfillInformation(locationMetadata.queryStructure, preferredScaffoldData,
                                             scaffoldData);

  // create atDistance message using preferred data
  const atDistanceMessage = createTextForScaffold(locationMetadata.scaffoldStructure,
    backfilledInfo, locationName);

  // create atLocation message
  // let atLocationMessage = atDistanceMessage;
  // if (atLocationMessage === '') {
  //   atLocationMessage = createTextForScaffold(locationMetadata.scaffoldStructure,
  //     scaffoldData, locationName);
  // }
  let atLocationMessage = createTextForScaffold(locationMetadata.scaffoldStructure,
    scaffoldData, locationName);

  // get next query key: check if no question is available to ask, return undefined if so
  let queryKey = getNextQueryKey(locationMetadata.queryStructure, scaffoldData);
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
  let nextQuery = getNextQuery(locationMetadata.queryStructure, queryKey, scaffoldData, '');
  let queryText = nextQuery.queryPrompt;
  let queryAnswers = nextQuery.queryAnswers;

  queryText = queryText.replace('{{locationname}}', locationName);
  queryAnswers.push('I don\'t know');

  // create notificationCategory
  let notificationCategory = locationMetadata.locationType + '_' + queryKey;

  // create fullAtDistanceMessage and atDistanceResponses
  // if includeWithoutPref is specified (for opp at dist), just ask for info
  let fullAtDistanceMessage = '';
  let atDistanceResponses = [];

  if (includeWithoutPref && atDistanceMessage === '') {
    // special case for freefood
    if (locationMetadata.locationType === 'freefood') {
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
 * Back fills information in a scaffold if child information is valid, but user doesn't prefer
 *
 * @param queryStructure {object} structure of query and data scaffold
 * @param preferredScaffoldData {object} preferred data stored in scaffold
 * @param allScaffoldData {object} current data stored in scaffold
 * @returns {object} preferred info scaffold filled with values for any parent nodes
 */
const backfillInformation = function (queryStructure, preferredScaffoldData, allScaffoldData) {
  // create new output object
  let backfilledScaffold = JSON.parse(JSON.stringify(preferredScaffoldData));
  _.forEach(queryStructure, (currentComponent) => {
    recursiveBackfill(currentComponent, backfilledScaffold, allScaffoldData);
  });

  // recursiveBackfill(queryStructure, backfilledScaffold, allScaffoldData);

  // // find the parent key for each child and fill with info if valid
  // _.forEach(preferredScaffoldData, (value, key) => {
  //   // only back fill for keys that user has preferred information for
  //   if (value !== '') {
  //     let currParentKey = getParentKeyForChild(queryStructure, key, '');
  //
  //     // fill if valid parent key
  //     if (currParentKey !== '' && allScaffoldData.hasOwnProperty(currParentKey)) {
  //       backfilledScaffold[currParentKey] = allScaffoldData[currParentKey];
  //     }
  //   }
  // });

  return backfilledScaffold;
};

/**
 * Recursively fills in data for parent nodes if child has preferential data.
 *
 * @param queryStructure {object} structure of query and data scaffold
 * @param backfilledScaffold {object} preferred data stored in scaffold with data backfilled
 * @param allScaffoldData {object} current data stored in scaffold
 * @returns {boolean}
 */
const recursiveBackfill = function (queryStructure, backfilledScaffold, allScaffoldData) {
  // leaf node case
  let currKey = queryStructure.key;
  if (queryStructure.children.length === 0) {
    // check if leaf node is filled
    if (backfilledScaffold.hasOwnProperty(currKey) && backfilledScaffold[currKey] !== '') {
      return true;
    }
  }

  // recurse through children if exist
  _.forEach(queryStructure.children, (currentComponent) => {
    let recursiveReturn = recursiveBackfill(currentComponent, backfilledScaffold, allScaffoldData);
    if (recursiveReturn) {
      backfilledScaffold[currKey] = allScaffoldData[currKey];
    }
  });

  // branch case
  return backfilledScaffold.hasOwnProperty(currKey) && backfilledScaffold[currKey] !== '';
};

/**
 * Gets the parent key for a child key in an information scaffold.
 *
 * @param queryStructure  {object} structure of query and data scaffold
 * @param childKey {string} key to find parent for
 * @param currParentKey {string} current parent key when recursing
 * @returns {string} parent key for child, or '' if no key
 */
const getParentKeyForChild = function (queryStructure, childKey, currParentKey) {
  // recurse through components, stopping if a valid key is found
  // if there is no info for a parent, don't recurse through its children
  let keyCandidate = '';
  _.forEach(queryStructure, (currentComponent) => {
    // check if key has a value in current info, return if not
    let currKey = currentComponent.key;
    if (currKey !== '' && currKey === childKey) {
      keyCandidate = currParentKey;
      return false;
    } else {
      let recursiveReturn = getParentKeyForChild(currentComponent.children, childKey, currKey);
      if (recursiveReturn !== '') {
        keyCandidate = recursiveReturn;
        return false;
      }
    }
  });

  return keyCandidate;
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
  let queryKey = getNextQueryKey(locationMetadata.queryStructure, scaffoldData);
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
  let nextQuery = getNextQuery(locationMetadata.queryStructure, queryKey, scaffoldData, '');
  let queryText = nextQuery.queryPrompt;
  let queryAnswers = nextQuery.queryAnswers;

  queryText = queryText.replace('{{locationname}}', locationName);

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
 * Determines the next key to query for, based on scaffold query structure.
 * If scaffold is full, return ''
 *
 * @param queryStructure {object} structure of queries for scaffold
 * @param scaffoldData {object} current data stored in scaffold
 * @returns {string} key for next query
 */
const getNextQueryKey = function (queryStructure, scaffoldData) {
  // recurse through components, stopping if a valid key is found
  // if there is no info for a parent, don't recurse through its children
  let keyCandidate = '';
  _.forEach(queryStructure, (currentComponent) => {
    // check if key has a value in current info, return if not
    let currKey = currentComponent.key;
    if (currKey !== '' && scaffoldData[currKey] === '') {
      keyCandidate = currKey;
      return false;
    } else {
      if (scaffoldData[currKey] !== 'no') {
        let recursiveReturn = getNextQueryKey(currentComponent.children, scaffoldData);
        if (recursiveReturn !== '') {
          keyCandidate = recursiveReturn;
          return false;
        }
      }
    }
  });

  return keyCandidate;
};

/**
 * Gets the next query and answer set, based on current data and desired query key.
 *
 * @param queryStructure {object} structure of queries for scaffold
 * @param targetQueryKey {string} query key to get query for
 * @param scaffoldData {object} current data stored in scaffold
 * @param currParentAnswer {string} current parent key when recursing
 * @returns {object} object with query and answers for next query
 */
const getNextQuery = function (queryStructure, targetQueryKey, scaffoldData, currParentAnswer) {
  // recurse through components, stopping if a valid key is found
  // if there is no info for a parent, don't recurse through its children
  let outputQuery = {
    queryPrompt: '',
    queryAnswers: []
  };

  let finalKey = '';
  _.forEach(queryStructure, (currentComponent) => {
    // check if key has a value in current info, return if not
    let currKey = currentComponent.key;
    if (currKey !== '' && currKey === targetQueryKey) {
      // check if parent's answer exists in current component's answer
      let queryAnswers = [];
      if (currentComponent.answers.hasOwnProperty(currParentAnswer)) {
        queryAnswers = JSON.parse(JSON.stringify(currentComponent.answers[currParentAnswer]));
      } else {
        queryAnswers = JSON.parse(JSON.stringify(currentComponent.answers.default));
      }

      outputQuery = {
        queryPrompt: currentComponent.prompt,
        queryAnswers: queryAnswers
      };
      finalKey = currKey;
      return false;
    } else {
      if (scaffoldData[currKey] !== 'no') {
        let recursiveReturn = getNextQuery(currentComponent.children, targetQueryKey, scaffoldData,
                                           scaffoldData[currKey]);
        if (recursiveReturn.queryPrompt !== '' && recursiveReturn.queryAnswers.length > 0) {
          outputQuery = recursiveReturn;
          finalKey = currKey;
          return false;
        }
      }
    }
  });

  // replace any {{text}} before returning
  let replacementTarget = '{{' + finalKey + '}}';
  outputQuery.queryPrompt = outputQuery.queryPrompt.replace(replacementTarget,
                                                            scaffoldData[finalKey]);

  return outputQuery;
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
  // TODO: allow for stuff underneath key
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
  let outputText = [scaffoldStructure.prefixText, middle];
  outputText = outputText.join(' ').trim();
  outputText = outputText + scaffoldStructure.suffixText; // no space before suffix (add manually)

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
  createNotificationWithPreferences: createNotificationWithPreferences
};