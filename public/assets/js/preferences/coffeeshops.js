$(document).ready(function() {
  var answeredQuestions = {
    'preference-coffeeshop-private-table': false,
    'preference-coffeeshop-private-table-outlet': false,
    'preference-coffeeshop-private-table-window': false,
    'preference-coffeeshop-private-couch-chair': false,
    'preference-coffeeshop-private-couch-chair-outlet': false,
    'preference-coffeeshop-private-couch-chair-window': false,
    'preference-coffeeshop-shared': false,
    'preference-coffeeshop-shared-outlet': false,
    'preference-coffeeshop-shared-window': false,
    'likelihood-coffeeshop-private-table': false,
    'likelihood-coffeeshop-private-table-outlet': false,
    'likelihood-coffeeshop-private-table-window': false,
    'likelihood-coffeeshop-private-couch-chair': false,
    'likelihood-coffeeshop-private-couch-chair-outlet': false,
    'likelihood-coffeeshop-private-couch-chair-window': false,
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
        $('#coffeeshop-progress').css('width', newProgressValue + '%');
      }
    }
  });
});