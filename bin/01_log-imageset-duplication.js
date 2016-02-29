/**
 * Module dependencies
 */
process.env.TZ = 'UTC';

var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var common = require('evergram-common');
var logger = common.utils.logger;
var userManager = common.user.manager;
var printManager = common.print.manager;
var emailManager = common.email.manager;
var config = require('../app/config')


logger.info('---- STARTING DUPLICATE imageSets CHECK ----');

var dupCount = 0;

//init db
common.db.connect().
then(function() {
    
    return userManager.findAll({
        criteria: {"signupComplete": true}
    });
}).
then(function(users) {
    var deferreds = [];

    _.forEach(users, function(user) {
        deferreds.push(printManager.findAllByUser(user));
    });

    return q.all(deferreds);
}).
then(function(usersImageSets) {
    var deferreds = [];

    _.forEach(usersImageSets, function(imageSets) {
        var imgSetDuplicates = {};

        _.forEach(imageSets, function(imageSet) {
            imgSetDuplicates[getKey(imageSet)] = imgSetDuplicates[getKey(imageSet)] || [];
            imgSetDuplicates[getKey(imageSet)].push(imageSet);
        });

        deferreds.push(logDuplicates(imgSetDuplicates));
    });

    return q.all(deferreds);
}).
then(function() {
    var deferred = q.defer();

    if (dupCount > 0) {
        logger.error('*** WARNING: ' + dupCount + ' dupe ImageSets found!');
        return sendNotificationEmail(dupCount);
    } else {
        logger.info('*** PASS: 0 dupe ImageSets found!');
    }

    deferred.resolve(null, true);

    return deferred.promise;
}).
then(function() {

    // wait 10s before closing
    setTimeout(function() {
        logger.info('---- COMPLETED DUPLICATE imageSets CHECK ----');
        process.exit(0);
    }, 10000);

});

function getKey(imageSet) {
    return moment(imageSet.startDate).format('YYYY-MM-DD') + '-' + moment(imageSet.endDate).format('YYYY-MM-DD');
}

function logDuplicates(imgSetDuplicates) {
    var deferred = q.defer();

    var dupFound = false;

    _.forEach(imgSetDuplicates, function(imageSets) {
        if (imageSets.length > 1) {
            var dedupedImageSets = imageSets.splice(0, 1);
            _.forEach(dedupedImageSets, function(imageSet) {
                dupFound = true;
                dupCount++;
                logger.error(imageSet.user.instagram.username + ': Duplicate image sets found for dates ' + getKey(imageSet) + ' with period ' + imageSet.period);
            });
        }
    });

    deferred.resolve(null,true);

    return deferred.promise;
}

function sendNotificationEmail(dupCount) {
    var deferred = q.defer();

    var toEmail = config.email.dev;
    var fromEmail = config.email.dev;

    var subject = 'WARNING: Duplicate ImageSets detected';
    var message = dupCount + ' duplicate ImageSets have been detected<br><br>';

    message += 'Please run removal script (evergram-common/bin/fixes/06-remove-duplicate-imagesets.js) on Pixy production to cleanup.<br><br>';
    message += '<strong>Note</strong>: Duplicate imageSets cause incorrect photo counts in analytics platforms so must be rectified quickly.<br>';

    logger.info('Sending notification email to ' + toEmail + ' from ' + fromEmail);

    emailManager.send(toEmail, fromEmail, subject, message).
        then(function(result) {
            deferred.resolve(result);
        }).
        fail(function(err) {
            logger.err('Error sending notification email: ' + err);
            deferred.reject(err);
        });

    return deferred.promise;
}
