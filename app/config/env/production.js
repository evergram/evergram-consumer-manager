/**
 * Expose
 */

module.exports = {
    sqs: {
        waitTime: process.env.SQS_WAIT_TIME || 20 //seconds
    },
    runEvery: process.env.CONSUMER_MANAGER_RUN_EVERY || 60, // Run the manager every x seconds
    jobs: {
        instagram: {
            runEvery: process.env.INSTAGRAM_CONSUMER_MANAGER_RUN_EVERY || 60 //seconds
        },
        print: {
            runEvery: process.env.PRINT_CONSUMER_MANAGER_RUN_EVERY || 60 //seconds
        }
    }
};
