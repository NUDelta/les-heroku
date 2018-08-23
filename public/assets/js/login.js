$(document).ready(function() {
  // check if user is already logged in. if so, redirect them. if not, display login.
  function redirectIfLoggedIn() {
    var user = verifyLoggedIn();
    if (user) {
      // if user's preferences are not filled, then redirect them to preference capture. else, home.
      if (Object.keys(user.get('preferences')).length < 4) {
        window.location.href = '/preferences/welcome';
      } else {
        window.location.href = '/home';
      }
    } else {
      $('body').show();
    }
  }
  redirectIfLoggedIn();

  // toggles for signup vs login
  $("#sign-in a").on('click', function (e) {
    e.preventDefault();
    $('#sign-in').hide();
    $('#sign-up').show();

    return false;
  });

  $("#sign-up a").on('click', function (e) {
    e.preventDefault();
    $('#sign-up').hide();
    $('#sign-in').show();

    return false;
  });

// sign-up logic
  $("#signup-form").submit(function (e) {
    e.preventDefault();

    // hide error message to begin
    var $signupError = $("#signup-error");
    $signupError.hide();

    // get inputs from user
    var firstName = $('#signupInputFirstName').val(),
        lastName = $('#signupInputLastName').val(),
        email = $('#signupInputEmail').val(),
        pwd = $('#signupInputPassword').val();

    var user = new Parse.User();
    user.save({
      username: email,
      email: email,
      password: pwd,
      firstName: firstName,
      lastName: lastName,
      vendorId: '',
      pushToken: '',
      lastLoggedIn: '',
      lastLoggedOut: '',
      preferences: {}
    }).then(user => {
      user.logIn().then(user => {
        console.log('success', user);
        window.location.href = '/preferences/welcome';
      }).catch(error => {
        console.log('error', error);
      });
    }).catch(error => {
      $signupError.text("Error: " + error.message);
      $signupError.show();
    });
  });

  // sign-in logic
  $("#signin-form").submit(function (e) {
    e.preventDefault();

    // hide error message to begin
    var $signinError = $("#signin-error");
    $signinError.hide();

    // get inputs from user
    var email = $('#signinInputEmail').val(),
        pwd = $('#signinInputPassword').val();

    // attempt login
    Parse.User.logIn(email, pwd).then(user => {
      console.log('success', user);
      window.location.href = '/home';
    }).catch(error => {
      $signinError.text("Error: " + error.message);
      $signinError.show();
    })
  });
});