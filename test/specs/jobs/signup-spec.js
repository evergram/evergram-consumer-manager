/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */
import sinon from 'sinon';
import should from 'should'; // eslint-disable-line no-unused-vars
import q from 'q';
import moment from 'moment';
import common from 'evergram-common';
import signedUpJob from '../../../lib/jobs/signed-up';
import fixtureHelper from '../../utils/fixture-helper';
const printManager = common.print.manager;
const User = common.models.User;
const PrintableImageSet = common.models.PrintableImageSet;

describe('Signup Job', function() {
    let sandbox;
    let printManagerSpy;

    before(function(done) {
        common.db.connect().
        then(function() {
            done();
        });
    });

    beforeEach(function(done) {
        sandbox = sinon.sandbox.create();
        done();
    });

    afterEach(function(done) {
        sandbox.restore();

        q.all([
            q.ninvoke(PrintableImageSet, 'remove', {}),
            q.ninvoke(User, 'remove', {})
        ]).
        then(function() {
            done();
        });
    });

    it('should create an image set for a newly signed up user', function(done) {
        let user;
        const userFixture = fixtureHelper.getUserFixture();
        userFixture.signupCompletedOn = moment().subtract(30, 'seconds');

        fixtureHelper.createUserFixture(userFixture).
        then(function(_user) {
            user = _user;
            return printManager.findAllByUser(user);
        }).
        then(function(imageSets) {
            // no image sets present for the user
            imageSets.length.should.be.eql(0);
            return true;
        }).
        then(function() {
            // test the run signed up function
            return signedUpJob.run(moment(), moment().subtract(60, 'seconds'));
        }).
        then(function() {
            // get all the image sets
            return printManager.findAllByUser(user);
        }).
        then(function(imageSets) {
            // ensure that only one image set was created
            imageSets.length.should.be.eql(1);
            imageSets[0].period.should.be.eql(0);
            done();
        }).
        fail(function(err) {
            done(err);
        });
    });

    it('should not create an image set for a newly signed up user when one exists already', function(done) {
        let user;
        let imageSetFixture;
        const userFixture = fixtureHelper.getUserFixture();
        userFixture.signupCompletedOn = moment().subtract(30, 'seconds');

        fixtureHelper.createImageSetFixture().
        then(function(_imageSetFixture) {
            imageSetFixture = _imageSetFixture;
            return fixtureHelper.createUserFixture(userFixture);
        }).
        then(function(_user) {
            user = _user;
            return printManager.findAllByUser(user);
        }).
        then(function(imageSets) {
            // already has an image set
            imageSets.length.should.be.eql(1);
            return true;
        }).
        then(function() {
            // test the run function
            return signedUpJob.run(moment(), moment().subtract(60, 'seconds'));
        }).
        then(function() {
            return printManager.findAllByUser(user);
        }).
        then(function(imageSets) {
            imageSets.length.should.be.eql(1);
            imageSets[0]._id.should.be.eql(imageSetFixture._id);
            done();
        }).
        fail(function(err) {
            done(err);
        });
    });

    it('should not create an image set for an old signed up user', function(done) {
        let user;
        const userFixture = fixtureHelper.getUserFixture();
        userFixture.signupCompletedOn = moment().subtract(60 * 60, 'seconds');

        printManagerSpy = sandbox.spy(printManager, 'getNumberOfImageSets');

        fixtureHelper.createUserFixture(userFixture).
        then(function(_user) {
            user = _user;
            // test the run function
            return signedUpJob.run(moment(), moment().subtract(60, 'seconds'));
        }).
        then(function() {
            return printManager.findAllByUser(user);
        }).
        then(function(imageSets) {
            printManagerSpy.should.not.be.called;
            imageSets.length.should.be.eql(0);
            done();
        }).
        fail(function(err) {
            done(err);
        });
    });

    xit('should create image sets for all signed up users that are missing them on first run', function(done) {
        done();
    });
});
