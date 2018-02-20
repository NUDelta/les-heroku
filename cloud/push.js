const apn = require('apn');

/*
 * Determine what certificates to use and setup APN.
 */
const nodeEnv = process.env.NODE_ENV || '';
let options = {},
    topic = '';

if (nodeEnv === 'development') {
    // Development Push
    console.log('Using DEVELOPMENT push.');

    options = {
        token: {
            key: __dirname + '/push-certificates/apns.p8', // Path to the key p8 file
            keyId: '8ZQHB4KZ62', // The Key ID of the p8 file
            teamId: 'W4E2C6X642', // The Team ID of your Apple Developer Account
        },
        production: false //working with development certificate
    };

    topic = 'edu.northwestern.delta.les-debug';
} else {
    // Enterprise push
    console.log('Using ENTERPRISE push.');

    options = {
        cert: __dirname + '/push-certificates/cert.pem',
        key: __dirname + '/push-certificates/key.pem',
        production: true //working with production certificate
    };

    topic = 'edu.northwestern.delta.les';
}

options.errorCallback = (err) => {
  console.log('APN Error:', err);
};

/**
 * Sends a push notification with message to list of devices.
 *
 * @param deviceTokens {array} devices to send notification to, as array of strings
 * @param message {string} message to send to each device
 * @param response {object} response object to return once notification is complete
 */
exports.sendPushWithMessage = (deviceTokens, message, response) => {
    const apnConnection = new apn.Provider(options);

    const note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 0;
    note.sound = 'ping.aiff';
    note.alert = message;
    note.payload = {
        'messageFrom': 'LES'
    };
    note.topic = topic;

    apnConnection.send(note, deviceTokens).then((result) => {
        if (response !== undefined) { response.success(result); }
    }).catch((err) => {
        if (response !== undefined) { response.error(err); }
    });

    apnConnection.shutdown();
};

/**
 * Sends a silent push notification to client, prompting reload of data.
 *
 * @param deviceTokens {array} devices to send notification to, as array of strings
 * @param dataSet {string} data to refresh
 * @param response {object} response object to return once complete
 */
exports.sendSilentRefreshNotification = (deviceTokens, dataSet, response) => {
    const apnConnection = new apn.Provider(options);

    const note = new apn.Notification();
    note.setContentAvailable(1);
    note.payload = {
        'updateType': dataSet
    };
    note.topic = topic;

    // send notification for each token
    apnConnection.send(note, deviceTokens).then((result) => {
        if (response !== undefined) { response.success(result); }
    }).catch((err) => {
        if (response !== undefined) { response.error(err); }
    });

    apnConnection.shutdown();
};

/**
 * Sends a request to receive a heartbeat from the user.
 *
 * @param deviceTokens {array} devices to send notification to, as array of strings
 * @param response {object} response object to return once complete
 */
exports.sendSilentHeartbeatNotification = (deviceTokens, response) => {
    const apnConnection = new apn.Provider(options);

    const note = new apn.Notification();
    note.setContentAvailable(1);
    note.payload = {
        'updateType': 'heartbeat'
    };
    note.topic = topic;

    // send notification for each token
    apnConnection.send(note, deviceTokens).then((result) => {
        response.success(result);
    }).catch((err) => {
        response.error(err);
    });

    apnConnection.shutdown();
};

/**
 * Sends a request to receive a location update from the user.
 *
 * @param deviceTokens {array} devices to send notification to, as array of strings
 * @param response {object} response object to return once complete
 */
exports.requestUserLocation = (deviceTokens, response) => {
    const apnConnection = new apn.Provider(options);

    const note = new apn.Notification();
    note.setContentAvailable(1);
    note.payload = {
        'updateType': 'location'
    };
    note.topic = topic;

    // send notification for each token
    apnConnection.send(note, deviceTokens).then((result) => {
        if (response !== undefined) { response.success(result); }
    }).catch((err) => {
        if (response !== undefined) { response.error(err); }
    });

    apnConnection.shutdown();
};
