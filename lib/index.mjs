'use strict';

import { logger } from './log';
import { createQueueConsumer } from './queue';
import { headless, puppeteerConfig } from './config';
import puppeteer from 'puppeteer';
import * as instagram from './definitions/instagram/index';
import { executeJob } from './executor/executeJob';

const tasks = {
    instagram: instagram.jobs,
    // facebook: {},
};

async function handleMessage(msg) {
    let browser;
    try {
        browser = await puppeteer.launch(puppeteerConfig);

        await executeJob(tasks, browser, msg.job);

        logger.debug("Closing browser ...");
        await browser.close();

        logger.debug("Done executing task");
    } finally {
        if (browser && browser.close) {
            await browser.close();
        }
    }
}

(async () => {
    logger.info(`Starting chrome in headless mode: ${headless}`);

    let consumer;
    try {
        consumer = createQueueConsumer(msg => handleMessage(msg));
        consumer.start();

    } catch (e) {
        logger.error(e);

        if (consumer && consumer.stop) {
            try {
                consumer.stop();
            } catch (e) {
                logger.error(`Error stopping consumer: ${e}`);
            }

        }

        process.exit(1);
    }
})();
