/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var q = require('q');
var _ = require('lodash');
var moment = require('moment');
var common = require('evergram-common');
var config = require('../../config').jobs.cleanup;
var logger = common.utils.logger;
var userManager = common.user.manager;

/**
 * A manager for cleaning up jobs if anything goes wrong.
 *
 * @constructor
 */
function CleanUpConsumerManager() {

}

/**
 * Runs the clean up consumer.
 *
 * @param lastRun
 */
CleanUpConsumerManager.prototype.run = function(runOn) {
    return getDirty(runOn).
        then(function(users) {
            if (users.length > 0) {
                logger.info(users.length + ' users are stuck in a queue');
            } else {
                logger.info('No users are stuck in a queue');
            }

            var deferreds = [];

            _.forEach(users, function(user) {
                deferreds.push(fixUser(user));
            });

            return q.all(deferreds);
        });
};

/**
 * Removes the user from the queues.
 *
 * @param user
 * @returns {*}
 */
function fixUser(user) {
    user.jobs.instagram.inQueue = false;
    return userManager.update(user);
}

/**
 * Gets users that are stuck in the queue.
 *
 * @param runOn
 * @returns {promise|*|q.promise}
 */
function getDirty(runOn) {
    var delta = moment(runOn).subtract(config.delta, 'seconds');

    logger.info('Getting users that are stuck in a queue');
    return userManager.findAll({
        criteria: {
            updatedOn: {
                $lte: delta
            },
            'jobs.instagram.inQueue': true,
            active: true
        }
    });
}

/**
 * Expose
 * @type {CleanUpConsumerManager}
 */
module.exports = exports = new CleanUpConsumerManager();