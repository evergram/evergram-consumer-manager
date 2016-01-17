/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
var env = process.env.NODE_ENV || 'development';

if (env === 'production') {
    require('./dist/lib/runner');
} else {
    require('babel-register');
    require('./lib/runner');
}
