export const sleep = ms => new Promise(res => setTimeout(res, ms));

export const scroll = page => page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight);
});

export async function getElementText(element) {
    const textNode = await element.getProperty("textContent");
    const text = await textNode.jsonValue();
    await textNode.dispose();
    await element.dispose();

    return text;
}

export function checkDataProperty(job, data, prop) {
    if (!(prop in data)) {
        throw new Error(`missing data property ${prop} for job ${job}`);
    }
}
