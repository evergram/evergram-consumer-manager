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
PrintConsumerManager.prototype.run = function () {
    var deferred = q.defer();

    getPrintableImageSets().then(function (imageSets) {
        if (imageSets.length > 0) {
            logger.info('Adding ' + imageSets.length + ' messages to the print queue');
        } else {
            logger.info('No image sets added to the print queue');
        }

        var deferreds = [];

        _.forEach(imageSets, function (imageSet) {
            deferreds.push(addImageSetToQueue(imageSet));
        });

        q.all(deferreds).then(function () {
            deferred.resolve(imageSets);
        }).fail(function (err) {
            deferred.reject(err);
        }).done();
    }).fail(function (err) {
        deferred.reject(err);
    }).done();

    return deferred.promise;
};

/**
 * Adds a user to the instagram queue
 *
 * @param user
 * @returns {*}
 */
function addImageSetToQueue(imageSet) {
    var deferred = q.defer();

    logger.info('Adding ' + imageSet._id + ' to the print queue');

    sqs.createMessage(sqs.QUEUES.PRINT, '{"id": "' + imageSet._id + '"}').then(function () {
        imageSet.inQueue = true;
        printManager.save(imageSet).
        then(function () {
            deferred.resolve(imageSet);
        }).fail(function (err) {
            deferred.reject(err);
        }).done();
    }).fail(function (err) {
        deferred.reject(err);
    }).done();

    return deferred.promise;
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
module.exports = exports = new PrintConsumerManager;