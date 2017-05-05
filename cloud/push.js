// setup apn and options for pushing
var apn = require('apn');

// DEBUG PUSH
var options = {
    token: {
        key: __dirname + '/push-certificates/apns.p8', // Path to the key p8 file
        keyId: '8ZQHB4KZ62', // The Key ID of the p8 file
        teamId: 'W4E2C6X642', // The Team ID of your Apple Developer Account
    },
    production: false //working with development certificate
};

var topic = 'edu.northwestern.delta.les-debug';

// ENTERPRISE PUSH
// var options = {
//     cert: __dirname + '/push-certificates/cert.pem',
//     key: __dirname + '/push-certificates/key.pem',
//     production: true //working with production certificate
// };
//
// var topic = 'edu.northwestern.delta.les';

var apnError = function(err) {
    console.log('APN Error:', err);
};
options.errorCallback = apnError;

exports.sendPush = function(deviceToken) {
    var apnConnection = new apn.Provider(options);

    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 0;
    note.sound = 'ping.aiff';
    note.alert = 'Welcome to LES!';
    note.payload = {
        'messageFrom': 'LES'
    };
    note.topic = topic;

    apnConnection.send(note, deviceToken).then((result) => {
        console.log(result);
    });
    apnConnection.shutdown();
};

exports.sendPushWithMessage = function(deviceTokens, message) {
    var apnConnection = new apn.Provider(options);

    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 0;
    note.sound = 'ping.aiff';
    note.alert = message;
    note.payload = {
        'messageFrom': 'LES'
    };
    note.topic = topic;

    apnConnection.send(note, deviceTokens).then((result) => {
        console.log(result);
    });
    apnConnection.shutdown();
};

exports.sendSilentRefreshNotification = function(tokenArray, dataSet) {
    var apnConnection = new apn.Provider(options);

    var note = new apn.Notification();
    note.setContentAvailable(1);
    note.payload = {
        'updateType': dataSet
    };
    note.topic = topic;

    // send notification for each token
    apnConnection.send(note, tokenArray).then((result) => {
        console.log(result);
    });

    apnConnection.shutdown();
};
