import { viewport } from '../config';
import { logger } from '../log';

export async function executeJob(tasks, browser, job) {
    const page = await browser.newPage();
    await page.setViewport(viewport);

    page.on('console', msg => logger.debug(`${job.task}@${job.network} page:`, msg.text()));

    // await page.screenshot({path: 'data/insta.png'});
    //
    // // Get the "viewport" of the page, as reported by the page.
    // const dimensions = await page.evaluate(() => {
    //     return {
    //         width: document.documentElement.clientWidth,
    //         height: document.documentElement.clientHeight,
    //         deviceScaleFactor: window.devicePixelRatio
    //     };
    // });
    //
    // console.log('Dimensions:', dimensions);

    if (!(job.network in tasks)) {
        throw new Error(`Network ${job.network} not found`);
    }

    if (!(job.task in tasks[job.network])) {
        throw new Error(`Task ${job.task} not found for network ${job.network}`);
    }

    const task = tasks[job.network][job.task];
    await task(page, job.user);

    await page.close();
}
