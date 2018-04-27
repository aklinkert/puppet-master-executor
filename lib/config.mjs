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
