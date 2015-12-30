/**
 * Expose
 */

export default {
    sqs: {
        // seconds
        waitTime: process.env.SQS_WAIT_TIME || 20
    },

    // Run the manager every x seconds
    runEvery: process.env.CONSUMER_MANAGER_RUN_EVERY || 60,
    jobs: {
        instagram: {
            // seconds
            runEvery: process.env.INSTAGRAM_CONSUMER_MANAGER_RUN_EVERY || 60,
            active: true
        },
        print: {
            // seconds
            runEvery: process.env.PRINT_CONSUMER_MANAGER_RUN_EVERY || 60,
            active: true
        },
        cleanup: {
            // seconds
            runEvery: process.env.CLEANUP_CONSUMER_MANAGER_RUN_EVERY || 60,

            // 1 hr
            delta: process.env.CLEANUP_CONSUMER_MANAGER_DELTA || 60 * 60,
            active: true
        },
        'signed-up': {
            // seconds
            runEvery: process.env.SIGNED_UP_CONSUMER_MANAGER_RUN_EVERY || 60,
            active: true
        }
    }
};
