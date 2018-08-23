$(document).ready(function() {
  /**
   * Checks if user is logged in and welcomes them if so. Otherwise, redirects them to login.
   */
  function welcomeUser() {
    var user = verifyLoggedIn();
    if (user) {
      // if user's preferences are not filled, then redirect them to preference capture. else, home.
      if (Object.keys(user.get('preferences')).length < 4) {
        window.location.href = '/preferences/welcome';
      } else {
        var $welcomeMessage = $('#welcomemessage');
        $welcomeMessage.text('Welcome back, ' + user.get('firstName') + '!');
        $('body').show();
      }
    } else {
      window.location.href = '/';
    }
  }
  welcomeUser();

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