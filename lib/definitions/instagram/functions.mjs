import { chances, selectors, urls } from './const';
import { logger } from '../../log';
import { chance, getElementText, sleep } from '../../shared/functions';

export async function login(page, user) {
    await page.goto(urls.login);

    logger.info(`Filling out login form for user ${user.username}.`);

    await page.waitForSelector(selectors.login.username);
    await page.type(selectors.login.username, user.username);

    await page.waitForSelector(selectors.login.password);
    await page.type(selectors.login.password, user.password);

    await page.waitForSelector(selectors.login.submit);

    await sleep(1000);
    await page.click(selectors.login.submit);
    await sleep(1000);

    const errorNodes = await page.$$(selectors.login.errors);
    if (errorNodes.length > 0) {
        let errorMessages = [];
        for (const e of errorNodes) {
            const error = await getElementText(e);
            logger.info(`Error during login: ${error}`);
            errorMessages.push(error);
        }

        throw new Error(`Login was not successful. Messages: '${errorMessages.join("', '")}'`)
    }

    logger.info(`Login to instagram as ${user.username} was successful.`);

    await page.waitForSelector(selectors.login.timeline);
    await sleep(2000);
    logger.info("Timeline is ready.");

    const dialogCloseButton = await page.$(selectors.timeline.appDialogClose)
    if (dialogCloseButton !== null) {
        await dialogCloseButton.click();
        logger.debug("Closed app dialog")
    }
}

export async function likeAvailableItems(page) {
    const items = await page.$$(selectors.timeline.item);

    logger.info(`Found ${items.length} timeline items.`);
    let liked = 0;
    for (const item of items) {
        const user = await getElementText(await item.$(selectors.timeline.user));
        const likeButton = await item.$(selectors.timeline.likeButton);
        if (!likeButton) {
            logger.info(`Item of user ${user} already liked, skipping.`);
            continue;
        }

        await likeButton.click();
        logger.info(`Liked item of user ${user}`);
        liked++;
        await sleep(1000);
    }

    logger.info(`Liked ${liked} timeline items.`);
    return liked;
}

export async function followSomeDiscoverUsers(page) {
    await page.goto(urls.explore);
    await sleep(2000);
    const items = await page.$$(selectors.discoverPeople.item);

    logger.info(`Found ${items.length} possible follows.`);
    let liked = 0;
    for (const item of items) {
        const user = await getElementText(await item.$(selectors.discoverPeople.user));
        const followButton = await item.$(selectors.discoverPeople.followButton);
        if (!followButton) {
            logger.warning(`Follow button of user ${user} not found, skipping.`);
            continue;
        }

        const text = await getElementText(followButton);
        if (text === "Following") {
            logger.info(`Already following user ${user}`);
            continue;
        }

        if (chance() > chances.followDiscoverUser) {
            logger.info(`No luck with user ${user}, skipping.`)
        }

        await followButton.click();
        logger.info(`Followed user ${user}`);
        liked++;
        await sleep(1000);
    }

    logger.info(`Followed ${liked} users.`);
    return liked;
}

export async function followUsersBack(page) {
    await page.goto(urls.activity);
    await sleep(2000);
    const items = await page.$$(selectors.activity.item);

    logger.info(`Found ${items.length} users that followed me.`);
    let liked = 0;
    for (const item of items) {
        const user = await getElementText(await item.$(selectors.discoverPeople.user));
        const followButton = await item.$(selectors.discoverPeople.followButton);
        if (!followButton) {
            logger.warning(`Follow button of user ${user} not found, skipping.`);
            continue;
        }

        const text = await getElementText(followButton);
        if (text === "Following") {
            logger.info(`Already following user ${user}`);
            continue;
        }

        await followButton.click();
        logger.info(`Followed user ${user}`);
        liked++;
        await sleep(1000);
    }

    logger.info(`Followed ${liked} users that are following me.`);
    return liked;
}
