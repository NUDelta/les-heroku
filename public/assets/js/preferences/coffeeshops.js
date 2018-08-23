$(document).ready(function() {
  var answeredQuestions = {
    'preference-coffeeshop-privatetable': false,
    'preference-coffeeshop-privatetable-outlet': false,
    'preference-coffeeshop-privatetable-window': false,
    'preference-coffeeshop-privatecouchchair': false,
    'preference-coffeeshop-privatecouchchair-outlet': false,
    'preference-coffeeshop-privatecouchchair-window': false,
    'preference-coffeeshop-shared': false,
    'preference-coffeeshop-shared-outlet': false,
    'preference-coffeeshop-shared-window': false,
    'likelihood-coffeeshop-privatetable': false,
    'likelihood-coffeeshop-privatetable-outlet': false,
    'likelihood-coffeeshop-privatetable-window': false,
    'likelihood-coffeeshop-privatecouchchair': false,
    'likelihood-coffeeshop-privatecouchchair-outlet': false,
    'likelihood-coffeeshop-privatecouchchair-window': false,
    'likelihood-coffeeshop-shared': false,
    'likelihood-coffeeshop-shared-outlet': false,
    'likelihood-coffeeshop-shared-window': false
  };

  /**
   * Checks if user is logged in and show content.
   */
  function showPreferenceContent() {
    var user = verifyLoggedIn();
    if (user) {
      $('body').show();
    } else {
      window.location.href = '/';
    }
  }
  showPreferenceContent();

  /**
   * Logs out user when they click the logout button.
   */
  $('#logout').click(function(e) {
    e.preventDefault();
    Parse.User.logOut().then(user => {
      window.location.href = '/';
    }).catch(error => {
      console.log(error);
    });
  });

  /**
   *
   */
  $('.form-check-input').click(function(e) {
    // setup variables for each page
    var $targetSelector = $('#coffeeshop-progress');
    var progressStartPoint = 0;

    // mark question as answered
    if (answeredQuestions.hasOwnProperty(e.target.name)) {
      // compute and update if question is newly answered
      if (!answeredQuestions[e.target.name]) {
        // mark question as answered
        answeredQuestions[e.target.name] = true;

        // count number of questions answered
        var total = 0;
        var answeredQuestionCount = 0;

        for (var k in answeredQuestions) {
          if(answeredQuestions.hasOwnProperty(k)) {
            if (answeredQuestions[k]) {
              answeredQuestionCount++;
            }
            total++;
          }
        }

        // update progress bar
        total = total > 0 ? total : 1;
        var newProgressValue = 25 * (answeredQuestionCount / total);
        $targetSelector.css('width', newProgressValue + '%');
        $targetSelector.text((progressStartPoint + Math.round(newProgressValue)) + '%');
      }
    }
  });
});