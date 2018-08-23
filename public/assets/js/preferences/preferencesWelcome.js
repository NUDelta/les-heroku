$(document).ready(function() {
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

  // logout user
  $('#logout').click(function(e) {
    e.preventDefault();
    Parse.User.logOut().then(user => {
      window.location.href = '/';
    }).catch(error => {
      console.log(error);
    });
  });
});