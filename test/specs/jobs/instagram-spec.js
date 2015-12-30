/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */
import sinon from 'sinon'; // eslint-disable-line no-unused-vars
import should from 'should'; // eslint-disable-line no-unused-vars
import q from 'q';
import common from 'evergram-common';
import instagramJob from '../../../lib/jobs/instagram';
import fixtureHelper from '../../utils/fixture-helper';
const printManager = common.print.manager;
const sqs = common.aws.sqs;
const PrintableImageSet = common.models.PrintableImageSet;

describe('Instagram Job', function() {
    let sandbox;
    let sqsStub;

    before(function(done) {
        common.db.connect().
        then(function() {
            done();
        });
    });

    beforeEach(function(done) {
        sandbox = sinon.sandbox.create();
        sqsStub = sandbox.stub(sqs, 'createMessage');
        done();
    });

    afterEach(function(done) {
        sandbox.restore();

        q.ninvoke(PrintableImageSet, 'remove', {}).then(function() {
            done();
        });
    });

    it('should add an image set to the instagram queue', function(done) {
        sqsStub.returns(q.fcall(function() {
            return true;
        }));

        fixtureHelper.createImageSetFixture().
        then(function() {
            // test the run function
            return instagramJob.run(new Date());
        }).
        then(function() {
            return printManager.findAll();
        }).
        then(function(imageSets) {
            const imageSet = imageSets[0];
            sqsStub.should.be.called;
            imageSet.inQueue.should.be.true;
            done();
        });
    });

    it('should not add an image set that is already in the instagram queue', function(done) {
        const fixture = fixtureHelper.getImageSetFixture();
        fixture.inQueue = true;

        fixtureHelper.createImageSetFixture(fixture).
        then(function() {
            // test the run function
            return instagramJob.run(new Date());
        }).
        then(function() {
            sqsStub.should.not.be.called;
            done();
        });
    });

    it('should not add an image set that is ready for print', function(done) {
        const fixture = fixtureHelper.getImageSetFixture();
        fixture.isReadyForPrint = true;

        fixtureHelper.createImageSetFixture(fixture).
        then(function() {
            // test the run function
            return instagramJob.run(new Date());
        }).
        then(function() {
            sqsStub.should.not.be.called;
            done();
        });
    });

    it('should not add an image set that is already printed', function(done) {
        const fixture = fixtureHelper.getImageSetFixture();
        fixture.isPrinted = true;

        fixtureHelper.createImageSetFixture(fixture).
        then(function() {
            // test the run function
            return instagramJob.run(new Date());
        }).
        then(function() {
            sqsStub.should.not.be.called;
            done();
        });
    });

    it('should not add an image set of an inactive user', function(done) {
        const fixture = fixtureHelper.getImageSetFixture();
        fixture.user.active = false;

        fixtureHelper.createImageSetFixture(fixture).
        then(function() {
            // test the run function
            return instagramJob.run(new Date());
        }).
        then(function() {
            sqsStub.should.not.be.called;
            done();
        });
    });

    it('should not add an image set of a user that has not finished signup', function(done) {
        const fixture = fixtureHelper.getImageSetFixture();
        fixture.user.signupComplete = false;

        fixtureHelper.createImageSetFixture(fixture).
        then(function() {
            // test the run function
            return instagramJob.run(new Date());
        }).
        then(function() {
            sqsStub.should.not.be.called;
            done();
        });
    });
});
