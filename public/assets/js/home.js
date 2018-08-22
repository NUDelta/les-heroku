$(document).ready(function() {
  // check if user is logged in
  function checkIfLoggedIn() {
    var $welcomeMessage = $('#welcomemessage');
    var user = Parse.User.current();
    if (user) {
      $welcomeMessage.text('Welcome back, ' + user.get('firstName') + '!');
      $('body').show();
    } else {
      console.log('Forbidden.');
      window.location.href = '/';
    }
  }
  checkIfLoggedIn();

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