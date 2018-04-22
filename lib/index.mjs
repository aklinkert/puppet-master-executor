'use strict';

import puppeteer from 'puppeteer';
import * as instagram from './definitions/instagram';
import { executeJob } from './executor/executeJob';
import { logger } from './log';

const isDebug = process.env.NODE_ENV !== "production";

const tasks = {
    instagram: instagram.jobs,
    // facebook: {},
};

import job from './../data/insta_regular_task';

const headless = !!process.env.CHROMIUM_HEADLESS || !isDebug;
logger.info(`Starting chrome in headless mode: ${headless}`);

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: process.env.CHROMIUM_EXECUTABLE,
            args: process.env.CHROMIUM_EXECUTABLE ? ['--no-sandbox', '--headless', '--disable-gpu'] : [],
            headless: headless,
            slowMo: 10, // slow down by n ms
        });

        await executeJob(tasks, browser, job);
        await browser.close();

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


