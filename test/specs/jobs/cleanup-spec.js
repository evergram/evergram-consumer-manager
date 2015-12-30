/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */
import should from 'should'; // eslint-disable-line no-unused-vars
import q from 'q';
import moment from 'moment';
import common from 'evergram-common';
import cleanupJob from '../../../lib/jobs/cleanup';
import fixtureHelper from '../../utils/fixture-helper';
import config from '../../../lib/config';
const printManager = common.print.manager;
const PrintableImageSet = common.models.PrintableImageSet;
const cleanupConfig = config.jobs.cleanup;

describe('Cleanup Job', function() {
    before(function(done) {
        common.db.connect().
        then(function() {
            done();
        });
    });

    afterEach(function(done) {
        q.ninvoke(PrintableImageSet, 'remove', {}).
        then(function() {
            done();
        });
    });

    it('should not remove image sets from a queue that less than the configured delta', function(done) {
        const fixture = fixtureHelper.getImageSetFixture();
        fixture.inQueue = true;
        fixture.inQueueOn = moment().subtract(cleanupConfig.delta - 60, 'seconds');

        fixtureHelper.createImageSetFixture(fixture).
        then(function() {
            // test the run function
            return cleanupJob.run(moment());
        }).
        then(function() {
            return printManager.findById('5663d6f6dbb04c5b591b3d86');
        }).
        then(function(imageSet) {
            imageSet.inQueue.should.be.true;
            done();
        }).
        fail(function(err) {
            done(err);
        });
    });

    it('should remove image sets that are stuck in an instagram queue', function(done) {
        const fixture = fixtureHelper.getImageSetFixture();
        fixture.inQueue = true;
        fixture.inQueueOn = moment().subtract(cleanupConfig.delta + 60, 'seconds');

        fixtureHelper.createImageSetFixture(fixture).
        then(function() {
            // test the run function
            return cleanupJob.run(moment());
        }).
        then(function() {
            return printManager.findById('5663d6f6dbb04c5b591b3d86');
        }).
        then(function(imageSet) {
            imageSet.inQueue.should.be.false;
            done();
        }).
        fail(function(err) {
            done(err);
        });
    });

    it('should remove image sets that are stuck in a print queue', function(done) {
        const fixture = fixtureHelper.getImageSetFixture();
        fixture.inQueue = true;
        fixture.isReadyForPrint = true;
        fixture.inQueueOn = moment().subtract(cleanupConfig.delta + 60, 'seconds');

        fixtureHelper.createImageSetFixture(fixture).
        then(function() {
            // test the run function
            return cleanupJob.run(moment());
        }).
        then(function() {
            return printManager.findById('5663d6f6dbb04c5b591b3d86');
        }).
        then(function(imageSet) {
            imageSet.inQueue.should.be.false;
            done();
        }).
        fail(function(err) {
            done(err);
        });
    });

    it('should not remove image sets that are already printed', function(done) {
        const fixture = fixtureHelper.getImageSetFixture();
        fixture.isPrinted = true;
        fixture.inQueue = true;
        fixture.inQueueOn = moment().subtract(cleanupConfig.delta + 60, 'seconds');

        fixtureHelper.createImageSetFixture(fixture).
        then(function() {
            // test the run function
            return cleanupJob.run(moment());
        }).
        then(function() {
            return printManager.findById('5663d6f6dbb04c5b591b3d86');
        }).
        then(function(imageSet) {
            imageSet.inQueue.should.be.true;
            done();
        }).
        fail(function(err) {
            done(err);
        });
    });
});
