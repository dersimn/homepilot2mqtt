This bridge connects the Rademacher Homepilot2 to an MQTT broker. I've built and tested it for the 
[RolloTube I-line DuoFern](https://www.rademacher.de/rolllaeden/rollladenmotore/rollotube-i-line-duofern/) series, since this is the only device I've from Rademacher. Feel free to implement more functions, but please use the GitHub Fork system if you do so, so that I can track your improvements.

I also don't use any of the Homepilot's logic functions. Logic is done in an upper layer (MQTT, OpenHAB, ..), so if you want to use this library would recommend to disable all automatic functions (called "Scenes") in the Homepilot webinterface.

## Git clone

	git clone https://github.com/dersimn/homepilot2mqtt.git
	cd homepilot2mqtt
	node index.js --help

## Npm global script

	npm install -g homepilot2mqtt
	homepilot2mqtt --help

### Example usage

	homepilot2mqtt --mqtt-url mqtt://10.0.0.20 --mqtt-retain false --bridge-ip 10.0.0.22 -v debug

## MQTT topics

	homepilot2/status/<device id>/position
	homepilot2/set   /<device id>/position

Message values are `UP`, `DOWN` or a position value between 0-100, where 0 is all the way up and 100 is all the way down.

## Credits

This project follows [Oliver "owagner" Wagner](https://github.com/owagner)'s architectural proposal for an [mqtt-smarthome](https://github.com/mqtt-smarthome/mqtt-smarthome).  
Built by copy-pasting together a bunch of snippets from [Sebastian "hobbyquaker" Raff](https://github.com/hobbyquaker)'s mqtt-smarthome scripts. Initial idea from [Marvin Heyder](http://www.imakeyouintelligent.com/rademacher-homepilot-json-api-via-webbrowser-ansteuern/).