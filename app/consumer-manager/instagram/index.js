/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var q = require('q');
var _ = require('lodash');
var common = require('evergram-common');
var logger = common.utils.logger;
var sqs = common.aws.sqs;
var userManager = common.user.manager;

/**
 * A manager for Instagram consumers.
 *
 * @constructor
 */
function InstagramConsumerManager() {

}

/**
 * Runs the print consumer manager.
 *
 * @param lastRun
 */
InstagramConsumerManager.prototype.run = function(runOn) {
    return getUsers(runOn).
        then(function(users) {
            if (users.length > 0) {
                logger.info('Adding ' + users.length + ' messages to the instagram queue');
            } else {
                logger.info('No users added to the instagram queue');
            }

            var deferreds = [];

            _.forEach(users, function(user) {
                deferreds.push(addUserToQueue(user));
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
function addUserToQueue(user) {
    return sqs.createMessage(sqs.QUEUES.INSTAGRAM, '{"id": "' + user._id + '"}').then(function() {
        user.jobs.instagram.inQueue = true;
        return userManager.update(user);
    });
}

/**
 * Gets users depending on the last run date/time
 *
 * @param runOn
 * @returns {promise|*|q.promise}
 */
function getUsers(runOn) {
    logger.info('Getting users for instagram queue');
    return userManager.findAll({
        criteria: {
            $or: [
                {
                    'jobs.instagram.nextRunOn': {
                        $lte: runOn
                    },
                    'jobs.instagram.inQueue': false,
                    'instagram.authToken': {
                        $exists: true
                    },
                    signupComplete: true,
                    active: true
                },
                {
                    'jobs.instagram.lastRunOn': {
                        $exists: false
                    },
                    'jobs.instagram.inQueue': false,
                    'instagram.authToken': {
                        $exists: true
                    },
                    signupComplete: true,
                    active: true
                }
            ]
        }
    });
}

/**
 * Expose
 * @type {InstagramConsumerManager}
 */
module.exports = exports = new InstagramConsumerManager();
