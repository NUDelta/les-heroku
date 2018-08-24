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
  /* Workspace Specific Content */
  //////////////////////////////////

  /* progress tracker */
  const progressStartPoint = 25;
  let hasMadeChanges = false;

  /* scaffold info */
  const locationScaffoldName = 'workspace';
  const nextSectionName = 'gym';

  let answeredQuestions = {
    'preference-workspace-privateseating': false,
    'preference-workspace-privateseating-outlet': false,
    'preference-workspace-privateseating-window': false,
    'preference-workspace-sharedseating': false,
    'preference-workspace-sharedseating-outlet': false,
    'preference-workspace-sharedseating-window': false,
    'location-workspace-mudd': false,
    'location-workspace-main': false,
    'likelihood-workspace-privateseating': false,
    'likelihood-workspace-privateseating-outlet': false,
    'likelihood-workspace-privateseating-window': false,
    'likelihood-workspace-sharedseating': false,
    'likelihood-workspace-sharedseating-outlet': false,
    'likelihood-workspace-sharedseating-window': false
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
    'mudd': {
      scaffoldKey: '',
      valueMapping: {
        'yes': 'Mudd Common Area (outside library)'
      }
    },
    'main': {
      scaffoldKey: '',
      valueMapping: {
        'yes': 'Main 1South'
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
                            nextSectionName, '/preferences/create/gyms');
  })
});