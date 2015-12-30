/**
 * @author Josh Stuart <joshstuartx@gmail.com>
 */
import common from 'evergram-common';
import http from 'http';
import app from './app';
const logger = common.utils.logger;
const port = process.env.PORT || 8081;

// Create a server so we can do health checks
const server = http.createServer(function(request, response) {
    response.end('Alive');
});

// Start the server and the app process
server.listen(port, function() {
    logger.info('Consumer manager server up');

    common.db.connect().
    then(function() {
        app.run();
    });
});

process.on('SIGINT', function() {
    logger.info('Shutting down consumer manager');
    app.stop();
    server.close();
    process.exit();
});

// catch uncaught exceptions and close the server to ensure opsworks restart
process.on('uncaughtException', function(err) {
    logger.error('Uncaught exception', err);
    server.close();
    process.exit();
});
