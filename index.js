// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  liveQuery: {
    classNames: ['Posts', 'Comments'] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

// schedule recurring task to get location updates
var Parse = require('parse/node');
var push = require(__dirname + '/cloud/push.js');
var schedule = require('node-schedule');

Parse.initialize('PkngqKtJygU9WiQ1GXM9eC0a17tKmioKKmpWftYr');
Parse.serverURL = 'https://les-expand.herokuapp.com/parse/';

function requestCurrentUserLocation() {
  // get all users currently using application
  var userQuery = new Parse.Query('user');
  userQuery.descending('createdAt');
  userQuery.find({
    success: function(users) {
      var pushTokens = [];

      for (var i in users) {
        var currentUser = users[i];

        if (currentUser.get('pushToken') !== undefined) {
          pushTokens.push(currentUser.get('pushToken'));
        }
      }

      console.log(pushTokens);
      push.requestUserLocation(pushTokens);

      status.success('Location requests sent.');
    },
    error: function(error) {
      status.error('Requesting location failed with error: ' + error);
    }
  });
};

var locationJob = schedule.scheduleJob('*/30 * * * * *', function(){
  requestCurrentUserLocation();
});
