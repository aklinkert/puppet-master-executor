import { selectors, urls } from '../const';
import { checkDataProperty, getElementText, sleep } from '../../../shared/functions';
import { logger } from '../../../log';
import { login } from '../functions';
import util from 'util';

export async function followUser(page, user, data) {
    checkDataProperty("followUser", data, "user");

    await login(page, user);

    const url = util.format(urls.user, data.user);
    logger.debug(`Navigating to ${url}`);
    await page.goto(url);

    await page.waitForSelector(selectors.page.followButton);
    await sleep(1000);

    const btn = await page.$(selectors.page.followButton);
    if (!btn) {
        throw new Error(`Cannot find follow button`);
    }

    const text = await getElementText(btn);
    if (text === "Following") {
        logger.warning(`Already following user ${data.user}`);
        return;
    }

    if (text !== "Follow") {
        throw new Error(`Unexpected text ${text} on follow button`);
    }

    await page.click(selectors.page.followButton);
    await sleep(1000);

    logger.info(`Followed user ${data.user}`);
}

