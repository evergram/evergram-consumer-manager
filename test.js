/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */


var newrelic = require('newrelic');

var bg = newrelic.createBackgroundTransaction('running-jobs', function () {
    console.log('doiong stuff for a second');
    setTimeout(function () {
        newrelic.endTransaction();
        console.log('done');
    }, 1000);
});

bg();