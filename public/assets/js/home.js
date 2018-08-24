$(document).ready(function() {
  /**
   * Checks if user is logged in and welcomes them if so. Otherwise, redirects them to login.
   */
  function welcomeUser() {
    const user = verifyLoggedIn();
    if (user) {
      // if user's preferences are not filled, then redirect them to preference capture. else, home.
      console.log(user.get('preferenceProgress'));
      if (user.get('preferenceProgress') !== 'completed') {
        // window.location.href = '/preferences/welcome';
      } else {
        const $welcomeMessage = $('#welcomemessage');
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
    logoutUser();
  });
});