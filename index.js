#!/usr/bin/env node

const Mqtt = require('mqtt');
const log = require('yalm');
const Homepilot = require('./homepilot.js');

const pkg = require('./package.json');
const config = require('yargs')
    .env('HOMEPILOT2MQTT')
    .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
    .describe('verbosity', 'possible values: "error", "warn", "info", "debug"')
    .describe('name', 'instance name. used as mqtt client id and as prefix for connected topic')
    .describe('mqtt-url', 'mqtt broker url. See https://github.com/mqttjs/MQTT.js#connect-using-a-url')
    .describe('mqtt-username', 'mqtt broker username')
    .describe('mqtt-password', 'mqtt broker password')
    .describe('mqtt-retain', 'allow/disallow retain flag for mqtt messages')
    .describe('polling-interval', 'polling interval (in ms) to search for new devices and poll already added devices for status updates')
    .describe('bridge-ip', 'IP address of Homepilot2 bridge')
    .alias({
        h: 'help',
        m: 'mqtt-url',
        v: 'verbosity'
    })
    .boolean('mqtt-retain')
    .default({
        name: 'homepilot2',
        'mqtt-url': 'mqtt://127.0.0.1',
        'mqtt-retain': true,
        'polling-interval': 3000
    })
    .version()
    .help('help')
    .argv;

log.setLevel(config.verbosity);
log.info(pkg.name + ' ' + pkg.version + ' starting');
log.debug("loaded config: ", config);

Homepilot.setAddress(config.bridgeIp);

log.info('mqtt trying to connect', config.mqttUrl);
var mqttConnected = false;
const mqtt = Mqtt.connect(config.mqttUrl, {
    clientId: config.name + '_' + Math.random().toString(16).substr(2, 8),
    will: {topic: config.name + '/connected', payload: '0', retain: (config.mqttRetain)},
    username: config.mqttUsername,
    password: config.mqttPassword
});
mqtt.on('connect', () => {
    mqttConnected = true;

    log.info('mqtt connected', config.mqttUrl);
    mqtt.publish(config.name + '/connected', '1', {retain: (config.mqttRetain)});

    log.info('mqtt subscribe', config.name + '/set/#');
    mqtt.subscribe(config.name + '/set/#');
});
mqtt.on('close', () => {
    if (mqttConnected) {
        mqttConnected = false;
        log.error('mqtt closed ' + config.mqttUrl);
    }
});
mqtt.on('error', err => {
    log.error('mqtt', err);
});
mqtt.on('close', () => {
    log.warn('mqtt close');
});
mqtt.on('offline', () => {
    log.warn('mqtt offline');
});
mqtt.on('reconnect', () => {
    log.info('mqtt reconnect');
});

function mqttPublish(device, service, payload, options = {retain: (config.mqttRetain)}) {
    if (typeof payload === 'object') {
        payload = JSON.stringify(payload);
    } else if (payload != null) {
        payload = String(payload);
    } else {
        log.error("mqtt publish, payload given: NULL");
        return;
    }

    topic = config.name + "/status/" + device.id + service;

    mqtt.publish(topic, payload, options, err => {
        if (err) {
            log.error('mqtt publish', err);
        } else {
            log.debug('mqtt >', topic, payload);
        }
    });
}
mqtt.on('message', (topic, payload) => {
    payload = payload.toString();
    log.debug('mqtt <', topic, payload);

    if (payload.indexOf('{') !== -1) {
        try {
            payload = JSON.parse(payload);
            payload = payload["val"];
        } catch (err) {
            log.error(err.toString());
        }
    } else if (payload === 'false') {
        payload = "UP";
    } else if (payload === 'true') {
        payload = "DOWN";
    } else if (!isNaN(payload)) {
        payload = parseFloat(payload);
    }
    const [, method, id, datapoint] = topic.split('/');

    log.debug("mqtt < ", method, id, datapoint);

    switch (method) {
        case 'set':
            if (datapoint == "position") {
                Homepilot.moveId(id, payload).then((result) => {
                    log.debug("homepilot2 > ", result);
                }).catch((err) => {
                    log.error("homepilot2 > ", err);
                });
            }
            break;

        default:
            log.error('unknown method', method);
    }
});

var timer = setInterval(() => {
    Homepilot.getDevices().then((devices) => {
        devices.forEach((device) => {
            log.debug("homepilot2 < ", device.id, device.name, device.position);
            mqttPublish(device, "/position", device.position)
        });
    }).catch((err) => {
        console.log(err);
    });
}, config.pollingInterval);