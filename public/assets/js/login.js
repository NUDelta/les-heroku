$(document).ready(function() {
  // check if user is already logged in. if so, redirect them. if not, display login.
  function redirectIfLoggedIn() {
    const user = verifyLoggedIn();
    if (user) {
      // if user's preferences are not filled, then redirect them to preference capture. else, home.
      if (user.get('preferenceProgress') !== 'completed') {
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
    const $signupError = $("#signup-error");
    $signupError.hide();

    // get inputs from user
    const firstName = $('#signupInputFirstName').val().trim(),
          lastName = $('#signupInputLastName').val().trim(),
          email = $('#signupInputEmail').val().trim(),
          pwd = $('#signupInputPassword').val(),
          pwdConfirmation = $('#signupInputPasswordConfirmation').val();

    // check if ped and pwdConfirmation are the same
    if (pwd !== pwdConfirmation) {
      $signupError.text("Error: Password and Password Confirmation must match.");
      $signupError.show();
      return;
    }

    const user = new Parse.User();
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
      informationPreferences: {},
      locationPreferences: {},
      likelihoodToGo: {},
      preferenceProgress: ''
    }).then(user => {
      user.logIn().then(user => {
        console.log('success', user);
        window.location.href = '/preferences/welcome';
      }).catch(error => {
        console.log('error', error);
      });
    }).catch(error => {
      $signupError.text("Error: " + error.message.replace('username', 'email address'));
      $signupError.show();
    });
  });

  // sign-in logic
  $("#signin-form").submit(function (e) {
    e.preventDefault();

    // hide error message to begin
    const $signinError = $("#signin-error");
    $signinError.hide();

    // get inputs from user
    const email = $('#signinInputEmail').val(),
      pwd = $('#signinInputPassword').val();

    // attempt login
    Parse.User.logIn(email, pwd).then(user => {
      console.log('success', user);
      window.location.href = '/home';
    }).catch(error => {
      $signinError.text("Error: " + error.message.replace('username', 'email address'));
      $signinError.show();
    })
  });
});