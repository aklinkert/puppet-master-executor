import { selectors, urls } from './const';
import { logger } from '../../log';
import { sleep } from '../../shared/functions';

export async function getElementText(element) {
    const textNode = await element.getProperty("textContent");
    const text = await textNode.jsonValue();
    await textNode.dispose();
    await element.dispose();

    return text;
}

export async function login(page, user) {
    await page.goto(urls.login);

    logger.debug(`Filling out login form for user ${user.username}.`);

    await page.waitForSelector(selectors.login.username);
    await page.type(selectors.login.username, user.username);

    await page.waitForSelector(selectors.login.password);
    await page.type(selectors.login.password, user.password);

    await page.waitForSelector(selectors.login.submit);

    await sleep(500);
    await page.click(selectors.login.submit);
    await sleep(1000);

    const errorNodes = await page.$$(selectors.login.errors);
    if (errorNodes.length > 0) {
        let errorMessages = [];
        for (const e of errorNodes) {
            const error = await getElementText(e);
            logger.debug(`Error during login: ${error}`);
            errorMessages.push(error);
        }

        throw new Error(`Login was not successful. Messages: '${errorMessages.join("', '")}'`)
    }

    logger.info(`Login to instagram as ${user.username} was successful.`);

    await page.goto(urls.timeline);
    await waitForTimeline(page);

    logger.debug("Timeline is ready.");
}

export async function waitForTimeline(page) {
    // await page.waitForNavigation({ waitUntil: ["domcontentloaded"] });
    await page.waitForSelector(selectors.login.timeline);
}

export async function likeAvailableItems(page) {
    const items = await page.$$(selectors.timeline.item);

    logger.debug(`Found ${items.length} items.`);
    let liked = 0;
    for (const item of items) {
        const user = await getElementText(await item.$(selectors.timeline.user));
        const likeButton = await item.$(selectors.timeline.likeButton);
        if (!likeButton) {
            logger.debug(`Item of user ${user} already liked, skipping.`);
            continue;
        }

        await likeButton.click();
        logger.debug(`Liked item of user ${user}`);
        liked++;
        await sleep(500);
    }

    logger.debug(`Liked ${liked} items.`);
    return liked;
}
