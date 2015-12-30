/**
 * Module dependencies.
 */

import devConfig from './env/development';
import testConfig from './env/test';
import prodConfig from './env/production';

export default {
    development: devConfig,
    test: testConfig,
    production: prodConfig
}[process.env.NODE_ENV || 'development'];
