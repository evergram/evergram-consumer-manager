/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import common from 'evergram-common';
import consumerManager from './consumer-manager';
import config from './config';
const logger = common.utils.logger;

class Application {
    constructor() {
        this._isRunning = false;
        this._stop = false;
    }

    /**
     * Continue to run this every minute, but only once the previous batch have finished
     */
    run() {
        if (!this._stop) {
            logger.info('Running application jobs');

            this._isRunning = true;

            consumerManager.run().
            then(function() {
                this._isRunning = false;
                logger.info('Completed running jobs');
                this.wait();
            }.bind(this)).
            fail(function(err) {
                logger.error(err);
                this._isRunning = false;
                this.wait();
            }.bind(this));
        } else {
            logger.info('The application is stopped');

            this._stop = false;
            this._isRunning = false;
        }
    }

    wait() {
        setTimeout(function() {
            logger.info('Finished waiting');
            this.run();
        }.bind(this), (config.runEvery * 1000));
        logger.info('Waiting ' + config.runEvery + ' seconds before we run jobs again...');
    }

    stop() {
        this._stop = true;
    }

    isRunning() {
        return this._isRunning;
    }
}

export default new Application();
