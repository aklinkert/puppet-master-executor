'use strict';

import puppeteer from 'puppeteer';
import * as instagram from './definitions/instagram';
import { executeJob } from './executor/executeJob';
import { logger } from './log';
import job from './../data/insta_regular_task';
import { defaultArgs } from './config';

const isDebug = process.env.NODE_ENV !== "production";

const tasks = {
    instagram: instagram.jobs,
    // facebook: {},
};

const headless = !!process.env.CHROMIUM_HEADLESS || !isDebug;
logger.info(`Starting chrome in headless mode: ${headless}`);

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: process.env.CHROMIUM_EXECUTABLE,
            args: defaultArgs.concat(process.env.CHROMIUM_EXECUTABLE ? ['--headless'] : []),
            ignoreHTTPSErrors: true,
            headless: headless,
            // slowMo: 10, // slow down by n ms
        });

        await executeJob(tasks, browser, job);

        logger.debug("Closing browser ...");
        await browser.close();

        logger.debug("Done");
        process.exit(0);
    } catch (e) {
        logger.error(e);
        process.exit(1);
    } finally {
        if (browser && browser.close) {
            await browser.close();
        }
    }
})();


