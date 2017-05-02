exports.sendPush = function () {
	var apn = require('apn');
	var options = {
			token: {
		        key: __dirname + '/push-certificates/apns.p8', // Path to the key p8 file
		        keyId: '8ZQHB4KZ62', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
		        teamId: 'W4E2C6X642', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
		    },
	        production: false //working with production certificate!!!!
	    };

	var apnError = function(err){
		console.log("APN Error:", err);
	}

	options.errorCallback = apnError;
	var apnConnection = new apn.Provider(options);
	console.log(apnConnection)
	// var myDevice = new apn.Device("bbdb453ef8edba04c4165d6e264d06f0709deef52846fbb84f80253fa8a6462d");
	//jjo
	//var myDevice = new apn.Device("b6f483f46e693fce14b35e027142ff4ebd3bec14df702f780057f7fd24c77103");
	//julia
	let myDevice = 'EFE4AB5EED2C0E829E08EAD1A0AB421F597EA3FEFE6C30AA24BD874ED79A3E30';
	// 8332cb0b0de2415bbb963457582c0546
	var note = new apn.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = 0;
	note.sound = "ping.aiff";
	note.alert = "Sleep Controller: Using cellphone before go to bed might affect your sleep quality!";
	note.payload = {'messageFrom': 'Caroline'};
	note.topic = 'edu.northwestern.delta.les-debug';

	apnConnection.send(note, myDevice).then( (result) => {
		console.log(result);
		apnConnection.shutdown();
	});
}
