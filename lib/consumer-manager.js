/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

import q from 'q';
import _ from 'lodash';
import moment from 'moment';
import common from 'evergram-common';
import allJobs from './jobs';
import config from './config';
const logger = common.utils.logger;

/**
 * A consumer manager that handles all of the consumers
 *
 * @constructor
 */
class ConsumerManager {
    constructor() {
        this.jobs = this.getAllJobs();
    }

    /**
     * Can run the job based on the last run date time and the run every time.
     *
     * @param lastRun
     * @param runEvery
     * @returns {Boolean}
     * @private
     */
    _canDoRun(lastRun, runEvery) {
        let runOn;

        if (lastRun === null) {
            return true;
        }

        runOn = moment(lastRun).add(runEvery, 'seconds');
        return runOn.isBefore(moment());
    }

    /**
     * Gets all the configured jobs.
     *
     * @returns {Object}
     */
    getAllJobs() {
        const jobs = {};

        _.forEach(config.jobs, function(job, jobName) {
            if (!!allJobs[jobName]) {
                jobs[jobName] = {
                    service: allJobs[jobName],
                    options: job,
                    lastRun: null
                };
            }
        });

        return jobs;
    }

    /**
     * Runs the consumer manager.
     *
     * @returns {Promise}
     */
    run() {
        const promises = [];

        _.forEach(this.jobs, function(job, jobName) {
            const deferred = q.defer();
            const lastRun = moment();

            if (!!job.options.active && this._canDoRun(job.lastRun, job.options.runEvery)) {
                promises.push(deferred.promise);

                logger.info('Running ' + jobName + ' job which was last run on ' + lastRun.format());

                job.service.run(lastRun, job.lastRun).
                then(function() {
                    job.lastRun = lastRun;
                    deferred.resolve();
                }).
                fail(function(err) {
                    deferred.reject(err);
                }).done();
            }
        }.bind(this));

        return q.all(promises);
    }
}

export default new ConsumerManager();
