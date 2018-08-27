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

  //////////////////////////////////
  /* Coffee Shop Specific Content */
  //////////////////////////////////

  /* progress tracker */
  const progressStartPoint = 0;
  let hasMadeChanges = false;

  /* scaffold info */
  const locationScaffoldName = 'coffeeshop';
  const nextSectionName = 'workspace';

  let answeredQuestions = {
    'preference-coffeeshop-privateseating': false,
    'preference-coffeeshop-privateseating-outlet': false,
    'preference-coffeeshop-privateseating-window': false,
    'preference-coffeeshop-sharedseating': false,
    'preference-coffeeshop-sharedseating-outlet': false,
    'preference-coffeeshop-sharedseating-window': false,
    'likelihood-coffeeshop-privateseating': false,
    'likelihood-coffeeshop-privateseating-outlet': false,
    'likelihood-coffeeshop-privateseating-window': false,
    'likelihood-coffeeshop-sharedseating': false,
    'likelihood-coffeeshop-sharedseating-outlet': false,
    'likelihood-coffeeshop-sharedseating-window': false
  };

  const scaffoldKeys = [
    'privateseating',
    'privateseatingoutlets',
    'privateseatingwindows',
    'sharedseating',
    'sharedseatingoutlets',
    'sharedseatingwindows'
  ];

  const questionScaffoldMapping = {
    'privateseating': {
      scaffoldKey: 'privateseating',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'privateseating-outlet': {
      scaffoldKey: 'privateseatingoutlets',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'privateseating-window': {
      scaffoldKey: 'privateseatingwindows',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'sharedseating': {
      scaffoldKey: 'sharedseating',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'sharedseating-outlet': {
      scaffoldKey: 'sharedseatingoutlets',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'sharedseating-window': {
      scaffoldKey: 'sharedseatingwindows',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'coffeelab': {
      scaffoldKey: '',
      valueMapping: {
        'yes': 'Coffee Lab'
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
                            nextSectionName, '/preferences/create/workspaces');
  })
});