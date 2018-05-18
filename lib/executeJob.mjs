import { defaultLanguage, viewport } from './config';
import vm from 'vm';
import { BufferedLogger } from './bufferedLogger';
import * as shared from './shared';

async function createPage(browser, logger) {
    const page = await browser.newPage();

    logger.debug(`Setting page viewport to width ${viewport.width} / height ${viewport.height}`);
    await page.setViewport(viewport);

    logger.debug(`Setting default language to ${defaultLanguage}`);
    await setLanguage(page, defaultLanguage);

    page.on('console', msg => logger.debug(`page: ${msg.text()}`));

    return page;
};

/**
 *
 * @param browser
 * @param logger
 * @param job
 * @returns {Promise<{logs: *, error: *}>}
 */
export async function executeJob(browser, logger, { code, vars, modules }) {
    const bufLog = new BufferedLogger();
    let error = null;

    try {
        const page = await createPage(browser, bufLog);
        const sandbox = vm.createContext({ vars, logger: bufLog, console: bufLog, page, ...shared });

        const bar = new vm.Module(code, { context: sandbox });
        await bar.link((s, r) => linker(modules, s, r));
        bar.instantiate();

        await bar.evaluate();
        await page.close();
    } catch (e) {
        error = e;
        logger.error(e);
    }

    return {
        logs: bufLog.getLogs(),
        error: error,
    }
}

async function setLanguage(page, lang) {
    await page.setExtraHTTPHeaders({
        'Accept-Language': lang,
    });

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "language", {
            get: function () {
                return [lang];
            }
        });
        Object.defineProperty(navigator, "languages", {
            get: function () {
                return [lang];
            }
        });
    });
}

async function linker(modules, specifier, referencingModule) {
    if (specifier in modules) {
        return new vm.Module(modules[specifier], { context: referencingModule.context });
    }

    throw new Error(`Unable to resolve dependency: ${specifier}`);
}
