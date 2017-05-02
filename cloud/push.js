// setup apn and options for pushing
var apn = require('apn');
var options = {
    token: {
        key: __dirname + '/push-certificates/apns.p8', // Path to the key p8 file
        keyId: '8ZQHB4KZ62', // The Key ID of the p8 file
        teamId: 'W4E2C6X642', // The Team ID of your Apple Developer Account
    },
    production: false //working with production certificate!!!!
};

var apnError = function(err) {
    console.log('APN Error:', err);
};
options.errorCallback = apnError;

exports.sendPush = function(deviceToken) {
    var apnConnection = new apn.Provider(options);
    console.log(apnConnection);

    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 0;
    note.sound = 'ping.aiff';
    note.alert = 'Welcome to LES!';
    note.payload = {
        'messageFrom': 'Caroline'
    };
    note.topic = 'edu.northwestern.delta.les-debug';

    apnConnection.send(note, deviceToken).then((result) => {
        console.log(result);
        apnConnection.shutdown();
    });
};
