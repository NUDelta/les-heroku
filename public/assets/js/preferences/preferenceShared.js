/**
 * Checks if user is logged in and show content.
 */
function showPreferenceContent() {
  const user = verifyLoggedIn();
  if (user) {
    $('body').show();
  } else {
    window.location.href = '/';
  }
}

/**
 * Generates a scaffold object based on an array of keys and a value to set for each key.
 * @param keyArray array of keys to create object for.
 * @param value value to set for each key. can be any valid javascript object.
 */
function generateScaffoldObjFromKeys(keyArray, value) {
  const outputObj = {};
  for (let i = 0; i < keyArray.length; i++) {
    const currentKey = keyArray[i];
    outputObj[currentKey] = JSON.parse(JSON.stringify(value));
  }

  return outputObj;
}

/**
 * Updates progress bar when item is checked off.
 *
 * @param targetQuestion
 * @param answeredQuestions
 * @param progressStartPoint
 * @param selectorString
 * @returns {*}
 */
function updateProgress(targetQuestion, answeredQuestions, progressStartPoint, selectorString) {
  // mark question as answered
  if (answeredQuestions.hasOwnProperty(targetQuestion)) {
    // compute and update if question is newly answered
    if (!answeredQuestions[targetQuestion]) {
      // mark question as answered
      answeredQuestions[targetQuestion] = true;

      // count number of questions answered
      let total = 0;
      let answeredQuestionCount = 0;

      for (let k in answeredQuestions) {
        if(answeredQuestions.hasOwnProperty(k)) {
          if (answeredQuestions[k]) {
            answeredQuestionCount++;
          }
          total++;
        }
      }

      // update progress bar
      total = total > 0 ? total : 1;
      const newProgressValue = 25 * (answeredQuestionCount / total) + progressStartPoint;

      const $progressBarSelector = $(selectorString);
      $progressBarSelector.css('width', newProgressValue + '%');
      $progressBarSelector.text((progressStartPoint + Math.round(newProgressValue)) + '%');

      // return to caller
      return {
        updatedAnsweredQuestions: answeredQuestions,
        hasMadeChanges: true
      }
    }
  }

  return null;
}

/**
 * Parses and saves form data to database.
 *
 * @param formData array objects ({question : answer}) of all answered questions
 * @param scaffoldKeys array of keys found in data scaffold
 * @param questionScaffoldMapping object mapping question keys/answers to scaffoldKeys
 * @param locationScaffoldName string name of current scaffold
 * @param nextSectionName string name of next scaffold in preference survey
 * @param redirectUrl string URL to redirect to upon successful save
 */
function saveFormDataAndRedirect(formData, scaffoldKeys, questionScaffoldMapping,
                                 locationScaffoldName, nextSectionName, redirectUrl) {
  // create output scaffold
  const preferenceScaffoldToSave = generateScaffoldObjFromKeys(scaffoldKeys, []);
  const notificationScaffoldToSave = {};

  for (let i = 0; i < formData.length; i++) {
    // get current question and response
    const currentQuestionKey = formData[i].name;
    const currentQuestionResponse = formData[i].value;

    // split question into components
    const questionComponents = currentQuestionKey.split('-');
    const questionType = questionComponents[0];
    const scaffoldMappingKey = questionComponents.slice(2).join('-');

    // assign values to appropriate output objects
    if (questionType === 'preference') {
      const currentScaffoldMapping = questionScaffoldMapping[scaffoldMappingKey];
      const scaffoldKey = currentScaffoldMapping.scaffoldKey;

      // only add value to scaffold if it has a valid remapping
      if (currentScaffoldMapping.valueMapping.hasOwnProperty(currentQuestionResponse)) {
        const remappedValue = currentScaffoldMapping.valueMapping[currentQuestionResponse];
        preferenceScaffoldToSave[scaffoldKey].push(remappedValue);
      }
    } else if (questionType === 'likelihood') {
      notificationScaffoldToSave[scaffoldMappingKey] = currentQuestionResponse;
    }
  }

  // get current user and setup data object to save
  const currentUser = Parse.User.current();
  let currentUserInformationPreferences = currentUser.get('informationPreferences');
  let currentUserLocationPreferences = currentUser.get('locationPreferences');
  let currentUserLikelihood = currentUser.get('likelihoodToGo');

  currentUserInformationPreferences[locationScaffoldName] = preferenceScaffoldToSave;
  currentUserLikelihood[locationScaffoldName] = notificationScaffoldToSave;

  currentUser.set('informationPreferences', currentUserInformationPreferences);
  currentUser.set('likelihoodToGo', currentUserLikelihood);
  currentUser.set('preferenceProgress', nextSectionName);

  // save data
  currentUser.save().then(user => {
    console.log(locationScaffoldName + ' data saved successfully for user ' +
      JSON.stringify(user));
    window.location.href = redirectUrl;
  }).catch(error => {
    console.log('Error in saving ' + locationScaffoldName + ' scaffold data for user ' + user +
      ' with error ' + JSON.stringify(error));
  });
}