This bridge connects the Rademacher Homepilot2 to an MQTT broker. I've built and tested it for the 
[RolloTube I-line DuoFern](https://www.rademacher.de/rolllaeden/rollladenmotore/rollotube-i-line-duofern/) series, since this is the only device I've from Rademacher. Feel free to implement more functions, but please use the GitHub Fork system if you do so, so that I can track your improvements.

I also don't use any of the Homepilot's logic functions. Logic is done in an upper layer (MQTT, OpenHAB, ..), so if you want to use this library would recommend to disable all automatic functions (called "Scenes") in the Homepilot webinterface.

## Locally

	git clone https://github.com/dersimn/homepilot2mqtt.git
	cd homepilot2mqtt
	node index.js --help

## Docker

	docker run -d --restart=always --mqtt-url mqtt://10.0.0.20 --bridge-address 10.0.0.22 dersimn/homepilot2mqtt

## MQTT topics

	homepilot2/status/<device id>
	homepilot2/set   /<device id>

This script accepts values from `0 .. 1.0` either plain format or in JSON object `{"val":1.0}`. 

## Credits

This project follows [Oliver "owagner" Wagner](https://github.com/owagner)'s architectural proposal for an [mqtt-smarthome](https://github.com/mqtt-smarthome/mqtt-smarthome).  
Built by copy-pasting together a bunch of snippets from [Sebastian "hobbyquaker" Raff](https://github.com/hobbyquaker)'s mqtt-smarthome scripts. Initial idea from [Marvin Heyder](http://www.imakeyouintelligent.com/rademacher-homepilot-json-api-via-webbrowser-ansteuern/).
