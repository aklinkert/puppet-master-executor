import { selectors, urls } from '../const';
import { scroll, sleep } from '../../../shared/functions';
import { logger } from '../../../log';
import { followSomeDiscoverUsers, followUsersBack, likeAvailableItems, login } from '../functions';

export async function regularBrowsing(page, user, data) {
    await login(page, user);

    let liked = 0;
    await page.waitForSelector(selectors.timeline.item);
    for (let i = 1; i <= 3; i++) {
        liked += await likeAvailableItems(page);
        await scroll(page);
        await sleep(1000);
    }

    const added = await followSomeDiscoverUsers(page);
    const addedBack = await followUsersBack(page);

    logger.info(`Liked ${liked} items, added ${added} suggestions and followed ${addedBack} users back.`);
}

