$(document).ready(function() {
  ////////////////////////////////
  /* Page Setup Related Content */
  ////////////////////////////////
  /**
   * Verify user is logged in before continuing
   */
  showPreferenceContent();

  /**
   * Logs out user when they click the logout button.
   */
  $('#logout').click(function(e) {
    e.preventDefault();
    logoutUser();
  });

  //////////////////////////
  /* Gym Specific Content */
  //////////////////////////

  /* progress tracker */
  const progressStartPoint = 50;
  let hasMadeChanges = false;

  /* scaffold info */
  const locationScaffoldName = 'gym';
  const nextSectionName = 'freefood';

  let answeredQuestions = {
    'preference-gym-treadmills': false,
    'preference-gym-freeweights': false,
    'preference-gym-freeweights-benches': false,
    'preference-gym-freeweights-squatracks': false,
    'preference-gym-stretch': false,
    'preference-gym-stretch-mats': false,
    'preference-gym-stretch-rollers': false,
    'likelihood-gym-treadmills': false,
    'likelihood-gym-freeweights': false,
    'likelihood-gym-freeweights-benches': false,
    'likelihood-gym-freeweights-squatracks': false,
    'likelihood-gym-stretch': false,
    'likelihood-gym-stretch-mats': false,
    'likelihood-gym-stretch-rollers': false
  };

  const scaffoldKeys = [
    'treadmills',
    'freeweights',
    'freeweightsbenches',
    'freeweightssquatracks',
    'stretch',
    'stretchmats',
    'stretchrollers'
  ];

  const questionScaffoldMapping = {
    'treadmills': {
      scaffoldKey: 'treadmills',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'freeweights': {
      scaffoldKey: 'freeweights',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'freeweights-benches': {
      scaffoldKey: 'freeweightsbenches',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'freeweights-squatracks': {
      scaffoldKey: 'freeweightssquatracks',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'stretch': {
      scaffoldKey: 'stretch',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'stretch-mats': {
      scaffoldKey: 'stretchmats',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'stretch-rollers': {
      scaffoldKey: 'stretchrollers',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'spac': {
      scaffoldKey: '',
      valueMapping: {
        'yes': 'SPAC'
      }
    }
  };

  /**
   * Enables or disables reload/exit alert on browser if changes have been made.
   * @returns {*}
   */
  window.onbeforeunload = function() {
    return hasMadeChanges ? true : null;
  };

  /**
   * Updates questionsAnswered and progress bar as user completes form.
   */
  $('.form-check-input').click(function(e) {
    const targetQuestion = e.target.name;
    const updatedState = updateProgress(targetQuestion, answeredQuestions,
                                        progressStartPoint, '#completion-progress');

    // update page state if not null
    if (updatedState != null) {
      answeredQuestions = updatedState.updatedAnsweredQuestions;
      hasMadeChanges = updatedState.hasMadeChanges;
    }
  });

  /**
   * Parses submitted form data, saves to server, and redirects to next page.
   */
  $('#location-preferences').submit(function(e) {
    e.preventDefault();

    // fetch submitted form data
    const formData = $('#location-preferences').serializeArray();

    // allow redirect without prompt
    window.onbeforeunload = null;

    saveFormDataAndRedirect(formData, scaffoldKeys, questionScaffoldMapping, locationScaffoldName,
                            nextSectionName, '/preferences/create/free-food');
  })
});