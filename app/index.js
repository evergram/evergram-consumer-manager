/**
 * Module dependencies.
 */

var common = require('evergram-common');
var consumerManager = require('./consumer-manager');
var config = require('./config');

//init db
common.db.connect();

/**
 * Continue to run this every minute, but only once the previous batch have finished
 */
function run() {
    log('Running jobs: ');
    consumerManager.run().then(function () {
        log('Complete: ');
        setTimeout(run, (config.runEvery * 1000));
        log('Waiting '+ config.runEvery + ' seconds :');
    });
}

function log(message) {
    console.log(message + (new Date()).toDateString() + ' ' + (new Date()).toTimeString());
}

run();