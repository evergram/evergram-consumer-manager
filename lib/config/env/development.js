/**
 * Expose
 */

export default {
    // Run the manager every x seconds
    runEvery: 60,
    jobs: {
        instagram: {
            // seconds
            runEvery: 60,
            active: true
        },
        print: {
            // seconds
            runEvery: 60,
            active: true
        },
        cleanup: {
            // seconds
            runEvery: 60,

            // 10 mins
            delta: 60 * 10,
            active: true
        },
        'signed-up': {
            // seconds
            runEvery: 60,
            active: true
        }
    }
};
