/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */
import q from 'q';
import _ from 'lodash';
import common from 'evergram-common';
const logger = common.utils.logger;
const userManager = common.user.manager;
const printManager = common.print.manager;

/**
 * A manager for customers that have just signed up to create constious things.
 *
 * @constructor
 */

class SignedUpJob {
    /**
     * Runs the signed up manager.
     *
     * @param runOn
     * @param lastRunOn
     * @returns {Promise}
     */
    run(runOn, lastRunOn) {
        return this._getRecentlySignedUpUsers(runOn, lastRunOn).
        then(function(users) {
            const promises = [];

            if (users.length > 0) {
                _.forEach(users, function(user) {
                    promises.push(this._createPrintImageSet(user));
                }.bind(this));
            } else {
                logger.info('No users signed up since ' + runOn.format());
            }

            return q.all(promises);
        }.bind(this));
    }

    /**
     * Creates the first image set for a user.
     *
     * @param user
     * @returns {Promise}
     */
    _createPrintImageSet(user) {
        return printManager.getNumberOfImageSets(user).
        then(function(numImageSets) {
            let imageSet;

            if (numImageSets === 0) {
                logger.info('Creating image set for ' + user.instagram.username);
                imageSet = printManager.getNewPrintableImageSet(user);
                return printManager.save(imageSet);
            }

            return true;
        });
    }

    /**
     * Gets recently signed up users
     *
     * @param runOn
     * @returns {Promise}
     */
    _getRecentlySignedUpUsers(runOn, lastRunOn) {
        const query = {
            criteria: {
                signupCompletedOn: {
                    $lte: runOn
                },
                signupComplete: true
            }
        };

        // if the last run on is not empty, add it to the query
        if (!!lastRunOn) {
            query.criteria.signupCompletedOn.$gt = lastRunOn;
        }

        logger.info('Getting recent signed up users');

        return userManager.findAll(query);
    }
}

export default new SignedUpJob();
