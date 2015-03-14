/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var Q = require('q');
var common = require('evergram-common');
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
    var deferred = Q.defer();

    getUsers(runOn).then(function (users) {
        var deferreds = [];

        for (var i in users) {
            deferreds.push(addUserToQueue(users[i]));
        }

        Q.all(deferreds).then(function () {
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
    var deferred = Q.defer();

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
 * @returns {promise|*|Q.promise}
 */
function getUsers(runOn) {
    return userManager.findUsers({
        criteria: {
            '$or': [
                {
                    'jobs.instagram.lastRunOn': {
                        '$gte': runOn
                    },
                    'jobs.instagram.inQueue': false,
                    'active': true
                },
                {
                    'jobs.instagram.lastRunOn': {
                        '$exists': false
                    },
                    'jobs.instagram.inQueue': false,
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