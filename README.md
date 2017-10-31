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
Built by copy-pasting together a bunch of snippets from [Sebastian "hobbyquaker" Raff](https://github.com/hobbyquaker)'s mqtt-smarthome scripts.