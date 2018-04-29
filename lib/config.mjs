export const isDebug = process.env.NODE_ENV !== "production";

export const headless = !!process.env.CHROMIUM_HEADLESS || !isDebug;

export const viewport = { width: 1920, height: 1080 };

export const defaultLanguage = "en";
export const defaultArgs = [
    `--no-sandbox`,
    `--disable-setuid-sandbox`,
    `--disable-dev-shm-usage`,
    `--lang=${defaultLanguage}`,
    `--disable-gpu`,
    `--window-size=${ viewport.width },${ viewport.height }`
];

export const puppeteerConfig = {
    executablePath: process.env.CHROMIUM_EXECUTABLE,
    args: defaultArgs.concat(process.env.CHROMIUM_EXECUTABLE ? ['--headless'] : []),
    ignoreHTTPSErrors: true,
    headless: headless,
    // slowMo: 10, // slow down by n ms
};
