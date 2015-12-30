/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */
import q from 'q';
import _ from 'lodash';
import moment from 'moment';
import common from 'evergram-common';
const logger = common.utils.logger;
const sqs = common.aws.sqs;
const printManager = common.print.manager;

/**
 * A manager for Instagram consumers.
 *
 * @constructor
 */
class InstagramConsumerManager {
    /**
     * Adds a printable image set to the instagram queue
     *
     * @param imageSet
     * @returns {Promise}
     */
    _addImageSetToQueue(imageSet) {
        logger.info(
            'Adding printable image set ' +
            imageSet._id +
            ' for ' +
            imageSet.user.instagram.username +
            ' to SQS'
        );

        return sqs.createMessage(sqs.QUEUES.INSTAGRAM, '{"id": "' + imageSet._id + '"}').
        then(function() {
            imageSet.inQueue = true;
            imageSet.inQueueOn = moment();
            return printManager.update(imageSet);
        });
    }

    /**
     * Gets image sets depending on the last run date/time
     *
     * @param runOn
     * @returns {Promise}
     */
    _getImageSets(runOn) {
        logger.info('Getting printable image sets for instagram queue');
        return printManager.findAll({
            criteria: {
                $or: [
                    {
                        nextRunOn: {
                            $lte: runOn
                        },
                        inQueue: false,
                        isPrinted: false,
                        isReadyForPrint: false,
                        'user.active': true,
                        'user.signupComplete': true
                    },
                    {
                        lastRunOn: {
                            $exists: false
                        },
                        inQueue: false,
                        isPrinted: false,
                        isReadyForPrint: false,
                        'user.active': true,
                        'user.signupComplete': true
                    }
                ]
            }
        });
    }

    /**
     * Runs the print consumer manager.
     *
     * @param runOn
     * @param lastRunOn
     * @returns {Promise}
     */
    run(runOn) {
        return this._getImageSets(runOn).
        then(function(imageSets) {
            const promises = [];

            if (imageSets.length > 0) {
                logger.info('Adding ' + imageSets.length + ' messages to the instagram queue');
            } else {
                logger.info('No image sets added to the instagram queue');
            }

            _.forEach(imageSets, function(imageSet) {
                promises.push(this._addImageSetToQueue(imageSet));
            }.bind(this));

            return q.all(promises);
        }.bind(this));
    }
}

export default new InstagramConsumerManager();
