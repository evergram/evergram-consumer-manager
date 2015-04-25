/**
 * Module dependencies.
 */

var common = require('evergram-common');
var logger = common.utils.logger;
var consumerManager = require('./consumer-manager');
var config = require('./config');

//init db
common.db.connect();

/**
 * Continue to run this every minute, but only once the previous batch have finished
 */
function run() {
    logger.info('Running jobs');

    consumerManager.run().then(function() {
        logger.info('Completed running jobs');
        setTimeout(run, (config.runEvery * 1000));
        logger.info('Waiting ' + config.runEvery + ' seconds before we run jobs again');
    }).fail(function(err) {
        setTimeout(run, (config.runEvery * 1000));
        logger.info('Waiting ' + config.runEvery + ' seconds before we run jobs again');
        logger.error(err);
    }).done();
}

run();