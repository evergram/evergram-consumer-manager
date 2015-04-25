/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var q = require('q');
var _ = require('lodash');
var common = require('evergram-common');
var logger = common.utils.logger;
var sqs = common.aws.sqs;
var printManager = common.print.manager;

/**
 * A manager for Instagram consumers.
 *
 * @constructor
 */
function PrintConsumerManager() {

}

/**
 * Runs the consumer manager.
 *
 * @param lastRun
 */
PrintConsumerManager.prototype.run = function() {
    return getPrintableImageSets().
        then(function(imageSets) {
            if (imageSets.length > 0) {
                logger.info('Adding ' + imageSets.length + ' messages to the print queue');
            } else {
                logger.info('No image sets added to the print queue');
            }

            var deferreds = [];

            _.forEach(imageSets, function(imageSet) {
                deferreds.push(addImageSetToQueue(imageSet));
            });

            return q.all(deferreds);
        });
};

/**
 * Adds a user to the instagram queue
 *
 * @param user
 * @returns {*}
 */
function addImageSetToQueue(imageSet) {
    logger.info('Adding ' + imageSet._id + ' to the print queue');

    return sqs.createMessage(sqs.QUEUES.PRINT, '{"id": "' + imageSet._id + '"}').
        then(function() {
            imageSet.inQueue = true;
            return printManager.save(imageSet);
        });
}

/**
 * Gets users depending on the last run date/time
 *
 * @param runOn
 * @returns {promise|*|q.promise}
 */
function getPrintableImageSets() {
    logger.info('Getting image sets for print queue');

    return printManager.findAll({
        criteria: {
            isReadyForPrint: true,
            isPrinted: false,
            inQueue: false
        }
    });
}

/**
 * Expose
 * @type {PrintConsumerManager}
 */
module.exports = exports = new PrintConsumerManager();