$(document).ready(function() {
  // initialize parse
  Parse.initialize('PkngqKtJygU9WiQ1GXM9eC0a17tKmioKKmpWftYr');

  var serverUrl = '';
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    serverUrl = 'http://localhost:5000/parse';
  } else {
    serverUrl = 'https://les-expand.herokuapp.com/parse';
  }

  console.log(serverUrl);
  Parse.serverURL = serverUrl;
});

/**
 * Verifies if a user is logged into website.
 * @returns {object} user if exists, otherwise undefined.
 */
function verifyLoggedIn() {
  // var $welcomeMessage = $('#welcomemessage');
  var user = Parse.User.current();
  if (user) {
    console.log('User authenticated.');
    return user;
  } else {
    console.log('No user authenticated.');
    return undefined;
  }
}