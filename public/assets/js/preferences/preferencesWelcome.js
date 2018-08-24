$(document).ready(function() {
  /**
   * Checks if user is logged in and show content.
   */
  function showPreferenceContent() {
    const user = verifyLoggedIn();
    if (user) {
      // check what preferences have been filled, and redirect appropriately
      const currentPreferenceCompletion = user.get('preferenceProgress');
      switch (currentPreferenceCompletion) {
        case 'coffeeshop':
          window.location.href = '/preferences/create/coffee-shops';
        break;
        case 'workspace':
          window.location.href = '/preferences/create/workspaces';
          break;
        case 'gym':
          window.location.href = '/preferences/create/gyms';
          break;
        case 'freefood':
          window.location.href = '/preferences/create/free-food';
          break;
        case 'completed':
          window.location.href = '/home';
          break;
        default:
          $('body').show();
          break;
      }
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

  /**
   * Begins preference capture process when button is clicked.
   */
  $('#begin-button').click(function(e) {
    e.preventDefault();

    // update preference progress
    const user = Parse.User.current();
    user.set('preferenceProgress', 'coffeeshop');
    user.save().then(user => {
      console.log('beginning preference capture for user: ' + JSON.stringify(user));
      window.location.href = '/preferences/create/coffee-shops';
    }).catch(error => {
      console.log(error);
    });
  });
});