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