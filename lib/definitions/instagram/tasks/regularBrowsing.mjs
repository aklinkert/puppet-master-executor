import { selectors, urls } from '../const';
import { scroll, sleep } from '../../../shared/functions';
import { logger } from '../../../log';
import { likeAvailableItems, login } from '../functions';

export async function regularBrowsing(page, user, data) {
    await login(page, user);

    let liked = 0;
    await page.waitForSelector(selectors.timeline.item);
    for (let i = 1; i <= 3; i++) {
        liked += await likeAvailableItems(page);
        await scroll(page);
        await sleep(1000);
    }

    await page.goto(urls.explore);
    let added = 0;

    logger.info(`Liked ${liked} items and added ${added} new follows.`);
}

