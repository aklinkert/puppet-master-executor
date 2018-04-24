import { defaultLanguage, viewport } from '../config';
import { logger } from '../log';

export async function executeJob(tasks, browser, job) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await setLanguage(page, defaultLanguage);

    page.on('console', msg => logger.debug(`${job.task}@${job.network} page:`, msg.text()));

    if (!(job.network in tasks)) {
        throw new Error(`Network ${job.network} not found`);
    }

    if (!(job.task in tasks[job.network])) {
        throw new Error(`Task ${job.task} not found for network ${job.network}`);
    }

    const task = tasks[job.network][job.task];
    await task(page, job.user, job.data || {});

    await page.close();
}

async function setLanguage(page, lang) {
    await page.setExtraHTTPHeaders({
        'Accept-Language': lang,
    });

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "language", {
            get: function () {
                return [lang];
            }
        });
        Object.defineProperty(navigator, "languages", {
            get: function () {
                return [lang];
            }
        });
    });
}
