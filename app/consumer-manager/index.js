/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

var Q = require('q');
var config = require('../config');

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

    for (jobName in config.jobs) {
        jobs[jobName] = {
            service: require('./' + jobName),
            options: config.jobs[jobName],
            lastRun: null
        };
    }

    return jobs;
};

ConsumerManager.prototype.run = function () {
    var deferreds = [];

    for (jobName in this.jobs) {
        var job = this.jobs[jobName];

        if (canDoRun(job.lastRun, job.options.runEvery)) {
            var deferred = Q.defer();
            deferreds.push(deferred);

            var lastRun = new Date();
            job.service.run(lastRun).then(function (r) {
                job.lastRun = lastRun;
                deferred.resolve();
            });
        }
    }

    return Q.all(deferreds);
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