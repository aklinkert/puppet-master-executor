'use strict';

import { logger } from './log';
import { createQueueConsumer } from './queue';
import { headless, puppeteerConfig } from './config';
import puppeteer from 'puppeteer';
import * as instagram from './definitions/instagram/index';
import { executeJob } from './executor/executeJob';

const tasks = {
    instagram: instagram.tasks,
    // facebook: {},
};

async function handleMessage(job, done) {
    let browser;
    try {
        browser = await puppeteer.launch(puppeteerConfig);

        await executeJob(tasks, browser, job);

        logger.debug("Closing browser ...");
        await browser.close();

        logger.debug("Done executing task");
        done();
    } catch (e) {
        logger.error(e);
        throw e;
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
        logger.info("Waiting for tasks ...");
        consumer = createQueueConsumer(handleMessage);
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
