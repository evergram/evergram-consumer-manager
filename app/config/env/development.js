/**
 * Expose
 */

module.exports = {
    // Run the manager every x seconds
    runEvery: 60,
    jobs: {
        instagram: {
            //seconds
            runEvery: 5
        },
        print: {
            //seconds
            runEvery: 60
        },
        cleanup: {
            //seconds
            runEvery: 60,

            //10 mins
            delta: 60 * 10
        }
    },
    email: {
        dev: 'dev@printwithpixy.com'
    }
};
