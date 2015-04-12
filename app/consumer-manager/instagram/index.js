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
 * Runs the consumer manager.
 *
 * @param lastRun
 */
InstagramConsumerManager.prototype.run = function (runOn) {
    var deferred = q.defer();

    getUsers(runOn).then(function (users) {
        if (users.length > 0) {
            logger.info('Adding ' + users.length + ' messages to the instagram queue');
        } else {
            logger.info('No users added to the instagram queue');
        }

        var deferreds = [];

        _.forEach(users, function (user) {
            deferreds.push(addUserToQueue(user));
        });

        q.all(deferreds).then(function () {
            deferred.resolve(users);
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
function addUserToQueue(user) {
    var deferred = q.defer();

    sqs.createMessage(sqs.QUEUES.INSTAGRAM, '{"id": "' + user._id + '"}').then(function () {
        user.jobs.instagram.inQueue = true;
        return q.ninvoke(user, 'save');
    }).then(function () {
        deferred.resolve(user);
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
function getUsers(runOn) {
    logger.info('Getting users for instagram queue');
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