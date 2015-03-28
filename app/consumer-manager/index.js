/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var q = require('q');
var _ = require('lodash');
var config = require('../config');
var logger = require('evergram-common').utils.logger;

/**
 * A consumer manager that handles all of the consumers
 *
 * @constructor
 */
function ConsumerManager() {
    this.jobs = this.getAllJobs();
}

ConsumerManager.prototype.getAllJobs = function () {
    var jobs = {};
    _.forEach(config.jobs, function (job, jobName) {
        jobs[jobName] = {
            service: require('./' + jobName),
            options: job,
            lastRun: null
        };
    });

    return jobs;
};

ConsumerManager.prototype.run = function () {
    var deferreds = [];

    _.forEach(this.jobs, function (job, jobName) {
        if (canDoRun(job.lastRun, job.options.runEvery)) {
            var deferred = q.defer();
            deferreds.push(deferred.promise);

            var lastRun = new Date();
            logger.info('Running ' + jobName + ' job which was last run on ' + lastRun);
            job.service.run(lastRun).then(function (r) {
                job.lastRun = lastRun;
                deferred.resolve();
            });
        }
    });

    return q.all(deferreds);
};

function canDoRun(lastRun, runEvery) {
    if (lastRun == null) {
        return true;
    } else {
        lastRun = new Date(lastRun);
        var runOn = lastRun.setSeconds(lastRun.getSeconds() + runEvery);
        return runOn <= new Date();
    }
}

/**
 * Expose
 * @type {ConsumerService}
 */
module.exports = exports = new ConsumerManager;