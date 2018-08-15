import util from 'util';

export const sleep = ms => new Promise(res => setTimeout(res, ms));

export const scroll = page => page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight);
});

export const scrollByPx = (page, px) => page.evaluate((px) => {
    window.scrollBy(0, px);
}, px);

export async function getElementText(element) {
    const textNode = await element.getProperty("textContent");
    const text = await textNode.jsonValue();
    await textNode.dispose();

    return text;
}

export const format = util.format;

export const sanitize = (str) => str
    .trim()
    .replace(/(?:\r\n|\r|\n)/g, ' \\n')
    .replace(/\s+/g, " ")
    .replace(/(?:\\n\s+)+/g, "\\n ");
