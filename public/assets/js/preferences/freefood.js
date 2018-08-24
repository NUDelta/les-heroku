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

  ////////////////////////////////
  /* Free Food Specific Content */
  ////////////////////////////////

  /* progress tracker */
  const progressStartPoint = 75;
  let hasMadeChanges = false;

  /* scaffold info */
  const locationScaffoldName = 'freefood';
  const nextSectionName = 'completed';

  let answeredQuestions = {
    'preference-freefood-foodevent': false,
    'preference-freefood-savory': false,
    'preference-freefood-savory-pizza': false,
    'preference-freefood-savory-pizza-cheese': false,
    'preference-freefood-savory-pizza-pepperoni': false,
    'preference-freefood-savory-baggedsnacks': false,
    'preference-freefood-savory-baggedsnacks-almonds': false,
    'preference-freefood-savory-baggedsnacks-popcorn': false,
    'preference-freefood-savory-baggedsnacks-potatochips': false,
    'preference-freefood-savory-baggedsnacks-pretzels': false,
    'preference-freefood-sweet': false,
    'preference-freefood-sweet-icecream': false,
    'preference-freefood-sweet-icecream-chocolate': false,
    'preference-freefood-sweet-icecream-vanilla': false,
    'preference-freefood-sweet-popsicles': false,
    'preference-freefood-sweet-popsicles-cherry': false,
    'preference-freefood-sweet-popsicles-grape': false,
    'preference-freefood-sweet-popsicles-orange': false,
    'preference-freefood-sweet-candy': false,
    'preference-freefood-sweet-candy-chocolatebar': false,
    'preference-freefood-sweet-candy-fruitsnacks': false,
    'likelihood-freefood-foodevent': false,
    'likelihood-freefood-savory': false,
    'likelihood-freefood-savory-pizza': false,
    'likelihood-freefood-savory-pizza-cheese': false,
    'likelihood-freefood-savory-pizza-pepperoni': false,
    'likelihood-freefood-savory-baggedsnacks': false,
    'likelihood-freefood-savory-baggedsnacks-almonds': false,
    'likelihood-freefood-savory-baggedsnacks-popcorn': false,
    'likelihood-freefood-savory-baggedsnacks-potatochips': false,
    'likelihood-freefood-savory-baggedsnacks-pretzels': false,
    'likelihood-freefood-sweet': false,
    'likelihood-freefood-sweet-icecream': false,
    'likelihood-freefood-sweet-icecream-chocolate': false,
    'likelihood-freefood-sweet-icecream-vanilla': false,
    'likelihood-freefood-sweet-popsicles': false,
    'likelihood-freefood-sweet-popsicles-cherry': false,
    'likelihood-freefood-sweet-popsicles-grape': false,
    'likelihood-freefood-sweet-popsicles-orange': false,
    'likelihood-freefood-sweet-candy': false,
    'likelihood-freefood-sweet-candy-chocolatebar': false,
    'likelihood-freefood-sweet-candy-fruitsnacks': false
  };

  const scaffoldKeys = [
    'foodevent',
    'kindfood',
    'specificfood',
    'typefood'
  ];

  const questionScaffoldMapping = {
    'foodevent': {
      scaffoldKey: 'foodevent',
      valueMapping: {
        'yes': 'yes'
      }
    },
    'savory': {
      scaffoldKey: 'kindfood',
      valueMapping: {
        'yes': 'savory'
      }
    },
    'savory-pizza': {
      scaffoldKey: 'specificfood',
      valueMapping: {
        'yes': 'pizza'
      }
    },
    'savory-pizza-cheese': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'cheese'
      }
    },
    'savory-pizza-pepperoni': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'pepperoni'
      }
    },
    'savory-baggedsnacks': {
      scaffoldKey: 'specificfood',
      valueMapping: {
        'yes': 'baggednutschips'
      }
    },
    'savory-baggedsnacks-almonds': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'almonds'
      }
    },
    'savory-baggedsnacks-popcorn': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'popcorn'
      }
    },
    'savory-baggedsnacks-potatochips': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'potatochips'
      }
    },
    'savory-baggedsnacks-pretzels': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'pretzels'
      }
    },
    'sweet': {
      scaffoldKey: 'kindfood',
      valueMapping: {
        'yes': 'sweet'
      }
    },
    'sweet-icecream': {
      scaffoldKey: 'specificfood',
      valueMapping: {
        'yes': 'icecream'
      }
    },
    'sweet-icecream-chocolate': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'chocolatebar'
      }
    },
    'sweet-icecream-vanilla': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'vanillabar'
      }
    },
    'sweet-popsicles': {
      scaffoldKey: 'specificfood',
      valueMapping: {
        'yes': 'popsicles'
      }
    },
    'sweet-popsicles-cherry': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'cherry'
      }
    },
    'sweet-popsicles-grape': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'grape'
      }
    },
    'sweet-popsicles-orange': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'orange'
      }
    },
    'sweet-candy': {
      scaffoldKey: 'specificfood',
      valueMapping: {
        'yes': 'candy'
      }
    },
    'sweet-candy-chocolatebar': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'chocolate'
      }
    },
    'sweet-candy-fruitsnacks': {
      scaffoldKey: 'typefood',
      valueMapping: {
        'yes': 'fruitsnacks'
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
                            nextSectionName, '/preferences/create/preferences-completed');
  })
});