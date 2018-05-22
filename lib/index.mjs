'use strict';

import { logger } from './log';
import { extraArgs, headless, puppeteerConfig, queueConfig, queueNameJobResults, queueNameJobs } from './config';
import puppeteer from 'puppeteer';
import { executeJob } from './executeJob';
import { sanitize } from './shared';
import amqp from 'amqplib';

async function handleJob(job) {
    let browser;
    try {
        logger.debug(`Creating browser`);
        browser = await puppeteer.launch(puppeteerConfig);

        logger.debug(`Executing script '${sanitize(job.code)}', having the modules ${Object.keys(job.modules).join(",")} and ${Object.keys(job.vars).length} variables`);
        const { logs, error, results } = await executeJob(browser, logger, job);

        logger.debug(`Closing browser`);
        await browser.close();

        logger.debug(`Done executing task`);
        logger.info(`Results: ${Object.keys(results).length}, Error: ${error}, Logs: ${logs.join(" \\n ")}`);

        return { logs, error, results };
    } catch (e) {
        logger.error(e);
        return { logs: [], error: e.toString(), results: {} };
    } finally {
        if (browser && browser.close) {
            await browser.close();
        }
    }

    return null;
}

async function handleRawMessage(ch, msg) {
    const job = JSON.parse(msg.content.toString());
    const result = await handleJob(job);
    const resultJson = JSON.stringify({
        job_id: job.id,
        ...result,
    });

    console.log(resultJson);

    await ch.sendToQueue(queueNameJobResults, Buffer.from(resultJson));
    await ch.ack(msg);
}

(async () => {
    logger.info(`Starting chrome in headless mode: ${headless}`);
    logger.info(`Starting with extra browser args: ${extraArgs}`);

    let consumer;
    try {
        const conn = await amqp.connect(`amqp://${queueConfig.username}:${queueConfig.password}@${queueConfig.host}:${queueConfig.port}`);
        const ch = await conn.createChannel();

        process.once('SIGINT', () => conn.close());

        await ch.prefetch(1);

        ch.consume(queueNameJobs, (msg) => handleRawMessage(ch, msg), { noAck: false });
        logger.info("Waiting for tasks");

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
