/**
 * @author Josh Stuart <joshstuartx@gmail.com>.
 */

import fs from 'fs';
const common = require('evergram-common');
const printManager = common.print.manager;
const userManager = common.user.manager;
const User = common.models.User;
const PrintableImageSet = common.models.PrintableImageSet;
const FIXTURE_PATH = __dirname + '/../fixtures/';

class FixtureHelper {
    /**
     * Continue to run this every minute, but only once the previous batch have finished
     */
    static getFixture(filename) {
        return JSON.parse(fs.readFileSync(FIXTURE_PATH + filename));
    }

    /**
     * Gets an image set from the fixture data.
     *
     * @returns {PrintableImageSet}
     */
    static getImageSetFixture() {
        return new PrintableImageSet(FixtureHelper.getFixture('printable-image-set.json'));
    }

    /**
     * Gets a user from the fixture data.
     *
     * @returns {User}
     */
    static getUserFixture() {
        return new User(FixtureHelper.getFixture('user.json'));
    }

    /**
     * Save a {@link PrintableImageSet}
     *
     * @param imageSet
     * @returns {Promise}
     */
    static createImageSetFixture(imageSet) {
        if (!imageSet) {
            imageSet = FixtureHelper.getImageSetFixture(); // eslint-disable-line no-param-reassign
        }

        return printManager.save(imageSet);
    }

    /**
     * Save a {@link User}
     *
     * @param user
     * @returns {Promise}
     */
    static createUserFixture(user) {
        if (!user) {
            user = FixtureHelper.getUserFixture(); // eslint-disable-line no-param-reassign
        }

        return userManager.create(user);
    }
}

export default FixtureHelper;
