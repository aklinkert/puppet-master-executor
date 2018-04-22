export const sleep = ms => new Promise(res => setTimeout(res, ms));

export const scroll = page => page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight);
});
