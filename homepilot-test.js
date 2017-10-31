const Homepilot = require('./homepilot.js');

Homepilot.setAddress("10.0.0.22");

Homepilot.moveId("1010002", "50").then((result) => {
	console.log(result);
}).catch((err) => {
	console.log(err);
});

Homepilot.getDevices().then((devices) => {
	devices.forEach((device) => {
		console.log(device.id, device.name, device.position);
	});
}).catch((err) => {
	console.log(err);
});