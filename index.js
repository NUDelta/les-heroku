// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const path = require('path');

let databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

const api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/les-expand',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:5000/parse',
  liveQuery: {
    classNames: ['Posts', 'Comments'] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// routes
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/login.html'));
});

app.get('/home', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/home.html'));
});

// launch application
const port = process.env.PORT || 5000;
const httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
  console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

// schedule recurring task to get location updates from users every minute
const push = require(__dirname + '/cloud/push.js');
const schedule = require('node-schedule');
const _ = require('lodash');

let scheduleRule = new schedule.RecurrenceRule();
scheduleRule.minute = new schedule.Range(0, 59, 1);

schedule.scheduleJob(scheduleRule, function () {
  // get all users currently using application
  const userQuery = new Parse.Query(Parse.User);
  userQuery.descending('createdAt');
  userQuery.find().then(users => {
    const pushTokens = [];
    const vendorIds = [];

    // only take users who have a valid push token
    _.forEach(users, (currentUser) => {
      if (currentUser.get('pushToken') !== '') {
        pushTokens.push(currentUser.get('pushToken'));
        vendorIds.push(currentUser.get('vendorId'));
      }
    });

    console.log('Sending location request to: ', pushTokens);
    push.sendSilentRefreshNotification(pushTokens, 'location', undefined);

    // successfully sent heartbeat request
    let ServerLog = Parse.Object.extend('ServerLog');
    let newServerLog = new ServerLog();
    newServerLog.set('caller', 'sendLocationRequest');
    newServerLog.set('success', true);
    newServerLog.set('logString', 'Sent location request for IDs: [' + vendorIds.join(', ') + ']');
    return newServerLog.save();
  }).catch(error => {
    console.error('Requesting locations failed with error: ' + JSON.stringify(error));

    // unsuccessfully notified dead apps
    let ServerLog = Parse.Object.extend('ServerLog');
    let newServerLog = new ServerLog();
    newServerLog.set('caller', 'sendLocationRequest');
    newServerLog.set('success', false);
    newServerLog.set('logString', 'Requesting locations failed with error: ' + error);
    return newServerLog.save();
  });
});
