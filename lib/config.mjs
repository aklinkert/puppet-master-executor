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

export const extraArgs = Array
    .from((process.env.CHROMIUM_EXTRA_ARGS || "").split(" "))
    .filter((arg) => !!arg);

export const puppeteerConfig = {
    executablePath: process.env.CHROMIUM_EXECUTABLE,
    args: defaultArgs
        .concat(process.env.CHROMIUM_EXECUTABLE ? ['--headless'] : [])
        .concat(extraArgs),
    ignoreHTTPSErrors: true,
    headless: headless,
    // slowMo: 10, // slow down by n ms
};

export const queueNameJobs = "puppet-master-jobs";
export const queueNameJobResults = "puppet-master-job-results";

const requireEnv = (name) => {
    const val = process.env[name];
    if (val === "" || val === undefined || val === null) {
        throw new Error(`Missing required env var ${name}`);
    }

    return val;
};

export const queueConfig = {
    host: requireEnv("QUEUE_HOST"),
    port: requireEnv("QUEUE_PORT"),
    username: requireEnv("QUEUE_USERNAME"),
    password: requireEnv("QUEUE_PASSWORD"),
};
