#!/usr/bin/env node

const pkg = require('./package.json');
const log = require('yalm');
const config = require('yargs')
    .env('HOMEPILOT2MQTT')
    .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
    .describe('verbosity', 'possible values: "error", "warn", "info", "debug"')
    .describe('name', 'instance name. used as mqtt client id and as prefix for connected topic')
    .describe('mqtt-url', 'mqtt broker url. See https://github.com/mqttjs/MQTT.js#connect-using-a-url')
    .describe('polling-interval', 'polling interval (in ms) for status updates')
    .describe('bridge-address', 'Homepilot2 address')
    .alias({
        h: 'help',
        m: 'mqtt-url',
        b: 'bridge-address',
        v: 'verbosity'
    })
    .default({
        name: 'homepilot2',
        'mqtt-url': 'mqtt://127.0.0.1',
        'polling-interval': 3000
    })
    .demandOption([
        'bridge-address'
    ])
    .version()
    .help('help')
    .argv;
const MqttSmarthome = require('mqtt-smarthome-connect');
const Timer = require('yetanothertimerlibrary');
const rp = require('request-promise');

log.setLevel(config.verbosity);
log.info(pkg.name + ' ' + pkg.version + ' starting');
log.debug("loaded config: ", config);

log.info('mqtt trying to connect', config.mqttUrl);
const mqtt = new MqttSmarthome(config.mqttUrl, {
    logger: log,
    will: {topic: config.name + '/maintenance/_bridge/online', payload: 'false', retain: true}
});
mqtt.connect();

mqtt.on('connect', () => {
    log.info('mqtt connected', config.mqttUrl);
    mqtt.publish(config.name + '/maintenance/_bridge/online', true, {retain: true});
});

var polling = new Timer(() => {
    getRolladen().then(devices => {
        devices.forEach((device) => {
            log.debug('homepilot2 <', device.did, device.visible, device.name, device.position);

            mqtt.publish(config.name + '/status/' + device.did, {
                'val': device.position / 100.0
            });

            mqtt.publish(config.name + '/maintenance/' + device.did + '/online', device.visible);
        });
    }).catch(err => {
        log.error(err.message);
    });
}).start(config.pollingInterval);

mqtt.subscribe(config.name + '/set/+', (topic, message, wildcard) => {
    let id = wildcard[0];

    // Extract value
    if (typeof message === 'object') {
        if ('val' in message) {
            if (typeof message.val === 'number') {
                setRolladen(id, Number(message.val * 100).toFixed(0)).then((result) => {
                    log.debug("homepilot2 > ", result);
                }).catch((err) => {
                    log.error("homepilot2 > ", err.message);
                });
            }
        }
    } else {
        if (typeof message === 'number') {
            setRolladen(id, Number(message * 100).toFixed(0)).then((result) => {
                log.debug("homepilot2 > ", result);
            }).catch((err) => {
                log.error("homepilot2 > ", err.message);
            });
        }
    }

    polling.exec();
});

function getRolladen() {
    return new Promise(function(resolve, reject) {
        rp({
            uri: "http://" + config.bridgeAddress + "/deviceajax.do?alldevices=1",
            json: true
        }).then(function (response) {
            resolve(response.devices);
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
            log.debug('homepilot2 > UP');
        } else if ( position == "DOWN" ) {
            args.cid = 3;
            log.debug('homepilot2 > DOWN');
        } else if ( position == "STOP" ) {
            args.cid = 2;
            log.debug('homepilot2 > STOP');
        } else if ( position <= 100 && position >= 0 ) {
            args.cid = 9;
            args.goto = position;
            log.debug('homepilot2 > move to', position);
        } else {
            reject("invalid position");
        }

        // Send command
        rp({
            method: "POST",
            uri: "http://" + config.bridgeAddress + "/deviceajax.do",
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
