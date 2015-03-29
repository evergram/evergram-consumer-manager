/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var q = require('q');
var _ = require('lodash');
var common = require('evergram-common');
var logger = common.utils.logger;
var aws = common.aws;
var userManager = common.user.manager;

/**
 * A manager for Instagram consumers.
 *
 * @constructor
 */
function InstagramConsumerManager() {

}

/**
 * Runs the consumer manager.
 *
 * @param lastRun
 */
InstagramConsumerManager.prototype.run = function (runOn) {
    var deferred = q.defer();

    getUsers(runOn).then(function (users) {
        if (users.length > 0) {
            logger.info('Adding ' + users.length + ' instagram consumer messages to the queue');
        } else {
            logger.info('No users added to the queue');
        }

        var deferreds = [];

        _.forEach(users, function (user) {
            deferreds.push(addUserToQueue(user));
        });

        q.all(deferreds).then(function () {
            deferred.resolve(users);
        });
    });

    return deferred.promise;
};

/**
 * Adds a user to the instagram queue
 *
 * @param user
 * @returns {*}
 */
function addUserToQueue(user) {
    var deferred = q.defer();

    aws.sqs.createMessage(aws.sqs.QUEUES.INSTAGRAM, '{"id": "' + user._id + '"}').then(function () {
        user.jobs.instagram.inQueue = true;
        user.save(function (err, user) {
            if (!err) {
                deferred.resolve(user);
            } else {
                deferred.reject(err);
            }
        });
    });

    return deferred.promise;
}

/**
 * Gets users depending on the last run date/time
 *
 * @param runOn
 * @returns {promise|*|q.promise}
 */
function getUsers(runOn) {
    return userManager.findAll({
        criteria: {
            '$or': [
                {
                    'jobs.instagram.nextRunOn': {
                        '$lte': runOn
                    },
                    'jobs.instagram.inQueue': false,
                    'instagram.authToken': {
                        '$exists': true
                    },
                    'active': true
                },
                {
                    'jobs.instagram.lastRunOn': {
                        '$exists': false
                    },
                    'jobs.instagram.inQueue': false,
                    'instagram.authToken': {
                        '$exists': true
                    },
                    'active': true
                }
            ]
        }
    });
}

/**
 * Expose
 * @type {InstagramConsumerManager}
 */
module.exports = exports = new InstagramConsumerManager;