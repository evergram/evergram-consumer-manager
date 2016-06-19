/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var q = require('q');
var _ = require('lodash');
var common = require('evergram-common');
var moment = require('moment');
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
 * Adds a user to the print queue
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

    // look for anything with a end date before midnight tonight & not yet printed
    var to = moment()
                    .hours(0)
                    .minutes(0)
                    .seconds(0)
                    .add(1,'days')
                    .toDate();

    var from = moment()
                    .hours(0)
                    .minutes(0)
                    .seconds(0)
                    .subtract(1,'months')
                    .toDate();

    logger.info("Dates from " + from + ", to " + to);

    return printManager.findAll({
        criteria: { 
            "startDate": { "$gt": from },
            "endDate": { "$lt": to },
            "isPrinted": false, 
            "inQueue": false,
            "user.billing.option" : { "$ne" : "INACTIVE" },
            "$or" : [
                { "images.instagram.1": { $exists: true } },
                { "images.facebook.1": { $exists: true } }
             ]
        }
    })
}

/**
 * Expose
 * @type {PrintConsumerManager}
 */
module.exports = exports = new PrintConsumerManager();
