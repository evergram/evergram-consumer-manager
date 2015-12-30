/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

import q from 'q';
import _ from 'lodash';
import common from 'evergram-common';
const logger = common.utils.logger;
const sqs = common.aws.sqs;
const printManager = common.print.manager;

/**
 * A manager for Print consumers.
 *
 * @constructor
 */
class PrintConsumerManager {
    /**
     * Adds a user to the instagram queue
     *
     * @param user
     * @returns {Promise}
     * @private
     */
    _addImageSetToQueue(imageSet) {
        logger.info('Adding ' + imageSet._id + ' to the print queue');

        return sqs.createMessage(sqs.QUEUES.PRINT, '{"id": "' + imageSet._id + '"}').
        then(function() {
            logger.info('Added ' + imageSet._id + ' to the print queue');
            imageSet.inQueue = true;
            return printManager.save(imageSet);
        });
    }

    /**
     * Gets users depending on the last run date/time
     *
     * @returns {Promise}
     * @private
     */
    _getPrintableImageSets() {
        logger.info('Getting image sets for print queue');

        return printManager.findAll({
            criteria: {
                isReadyForPrint: true,
                isPrinted: false,
                inQueue: false,
                'user.active': true,
                'user.signupComplete': true
            }
        });
    }

    /**
     * Runs the consumer manager.
     *
     * @param runOn
     * @param lastRunOn
     * @returns {Promise}
     */
    run() {
        return this._getPrintableImageSets().
        then(function(imageSets) {
            const promises = [];

            if (imageSets.length > 0) {
                logger.info('Adding ' + imageSets.length + ' messages to the print queue');
            } else {
                logger.info('No image sets added to the print queue');
            }

            _.forEach(imageSets, function(imageSet) {
                promises.push(this._addImageSetToQueue(imageSet));
            }.bind(this));

            return q.all(promises);
        }.bind(this));
    }
}

export default new PrintConsumerManager();
