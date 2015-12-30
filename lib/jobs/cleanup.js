/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */
import q from 'q';
import _ from 'lodash';
import moment from 'moment';
import common from 'evergram-common';
import config from '../config';
const cleanupConfig = config.jobs.cleanup;
const logger = common.utils.logger;
const printManager = common.print.manager;

/**
 * A manager for cleaning up jobs if anything goes wrong.
 *
 * @constructor
 */
class CleanUpConsumerManager {
    /**
     * Runs the clean up consumer.
     *
     * @param runOn
     * @param lastRunOn
     * @returns {Promise}
     */
    run(runOn) {
        return this._getDirty(runOn).
        then(function(imageSets) {
            const promises = [];

            if (imageSets.length > 0) {
                logger.info(imageSets.length + ' image sets are stuck in a queue');

                _.forEach(imageSets, function(imageSet) {
                    logger.info(
                        'Image set ' +
                        imageSet._id +
                        ' by ' +
                        imageSet.user.instagram.username +
                        ' was stuck in a queue'
                    );
                    promises.push(this._fixImageSets(imageSet));
                }.bind(this));
            } else {
                logger.info('No image sets are stuck in a queue');
            }

            return q.all(promises);
        }.bind(this));
    }

    /**
     * Removes the imageSet from the queues.
     *
     * @param imageSet
     * @returns {Promise}
     */
    _fixImageSets(imageSet) {
        imageSet.inQueue = false;
        return printManager.update(imageSet);
    }

    /**
     * Gets imageSets that are stuck in the queue.
     *
     * @param runOn
     * @returns {Promise}
     */
    _getDirty(runOn) {
        const delta = moment(runOn).subtract(cleanupConfig.delta, 'seconds');

        logger.info('Retrieving all image sets that are stuck in a queue');
        return printManager.findAll({
            criteria: {
                inQueueOn: {
                    $lte: delta
                },
                isPrinted: false,
                inQueue: true
            }
        });
    }
}

export default new CleanUpConsumerManager();
