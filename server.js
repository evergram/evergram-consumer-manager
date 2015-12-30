/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
process.env.TZ = 'UTC';

require('babel-register');
require('./lib/runner');
