/*

Usage:

	setRolladen("1010002", "50").then((result) => {
		console.log(result);
	});

	getRolladen().then((devices) => {
		devices.forEach((device) => {
			console.log(device.id, device.name, device.position);
		});
	});

*/

const rp = require('request-promise');

var address;

function setAddress(ip) {
	address = ip;
}

function getRolladen() {
	return new Promise(function(resolve, reject) {
		rp({
			uri: "http://" + address + "/deviceajax.do?alldevices=1",
			json: true
		}).then(function (response) {
			var devices = new Array();

			response.devices.forEach((device) => {
				var tmp = new Object();

				tmp.id = device.did;
				tmp.name = device.name;
				tmp.position = device.position;

				devices.push(tmp);
			});

			resolve(devices);
		}).catch(function (err) {
			reject(err);
		});
	});
}

function setRolladen(id, position) {
	return new Promise(function(resolve, reject) {
		// Build command object
		var args = new Object();
		args.did = id;
		args.command = 1;
		if ( position == "UP" ) {
			args.cid = 1;
		} else if ( position == "DOWN" ) {
			args.cid = 3;
		} else if ( position <= 100 && position >= 0 ) {
			args.cid = 9;
			args.goto = position;
		} else {
			reject("invalid position");
		}

		// Send command
		rp({
			method: "POST",
			uri: "http://" + address + "/deviceajax.do",
			form: args,
			json: true
		}).then(function (response) {
			if ( response.status == "uisuccess" ) {
				resolve("success");
			} else {
				reject(response);
			}
		}).catch(function (err) {
			reject(err);
		});
	});
}

module.exports.setAddress = setAddress;
module.exports.moveId = setRolladen;
module.exports.getDevices = getRolladen;
