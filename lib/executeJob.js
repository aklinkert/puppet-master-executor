import { defaultLanguage, viewport } from './config.js';
import vm from 'vm';
import { BufferedLogger } from './bufferedLogger.js';
import * as shared from './shared.js';

const importRegExp = new RegExp(/import .+ from .+/);
const baseURL = new URL('file://');

async function createPage(browser, logger) {
    const page = await browser.newPage();

    logger.debug(`Setting page viewport to width ${viewport.width} / height ${viewport.height}`);
    await page.setViewport(viewport);

    logger.debug(`Setting default language to ${defaultLanguage}`);
    await setLanguage(page, defaultLanguage);

    page.on('console', msg => logger.debug(`page: ${msg.text()}`));

    return page;
}

/**
 *
 * @param browser
 * @param logger
 * @param job
 * @returns {Promise<{logs: Array<Log>, error: String, results: Object}>}
 */
export async function executeJob(browser, logger, { code, vars, modules }) {
    const bufLog = new BufferedLogger();
    const results = {};
    let error = null;
    let page;

    try {
        page = await createPage(browser, bufLog);
        const moduleCode = wrapAsyncIIFE(code);

        await runCode(moduleCode, vars, page, bufLog, results, modules);
    } catch (e) {
        error = e.toString().replace(/^Error: /, "");
        logger.error(error);
        bufLog.error(error);
    } finally {
        if (page && page.close) {
            await page.close();
        }
    }

    return {
        logs: bufLog.getLogs(),
        error: error,
        results,
        finished_at: getAndUnset(results, "____finished_at"),
        started_at: getAndUnset(results, "____started_at"),
        duration: getAndUnset(results, "____duration"),
    }
}

function getAndUnset(results, key) {
    const value = results[key];
    delete results[key];
    return value;
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

async function linker(logger, modules, specifier, referencingModule) {
    logger.debug(`Linking module ${specifier} to ${referencingModule.url} (Available: ${Object.keys(modules)})`);
    if (specifier in modules) {
        return new vm.SourceTextModule(modules[specifier], { context: referencingModule.context, url: moduleUrl(`./puppet-master/module/${specifier}`) });
    }

    throw new Error(`Unable to resolve dependency: ${specifier}`);
}

function moduleUrl(module) {
    return new URL(module, baseURL).href;
}

function extractImports(module) {
    const importLines = [];
    const codeLines = [];

    const lines = module.replace("\r\n", "\n").split("\n");
    for (let line of lines) {
        if (line.match(importRegExp)) {
            importLines.push(line);
        } else {
            codeLines.push(line);
        }
    }

    return {
        imports: importLines.join("\n"),
        code: codeLines.map(line => "        " + line).join("\n"),
    };
}

function wrapAsyncIIFE(module) {
    const { imports, code } = extractImports(module);

    return `${imports}

(async () => {
    var ____started_at = new Date();

    try {
        ${code}

    } catch (e) {
        logger.error(e.toString());
        ____reject(e.toString());

    } finally {
        var ____finished_at = new Date();
        results.____duration = ____finished_at - ____started_at;
        results.____started_at = ____started_at.toISOString();
        results.____finished_at = ____finished_at.toISOString();

        logger.info(format("Code took %dms to execute.", results.____duration));
        ____resolve();
    }
})();
`;
}

async function runCode(moduleCode, vars, page, bufLog, results, modules) {
    await new Promise(async (resolve, reject) => {
        try {
            const context = vm.createContext({
                ____resolve: resolve,
                ____reject: reject,
                console: bufLog,
                logger: bufLog,
                results,
                page,
                vars,
                ...shared,
            });
            const module = new vm.SourceTextModule(moduleCode, { context, url: moduleUrl("./puppet-master/code") });

            await module.link((s, r) => linker(bufLog, modules, s, r));
            await module.evaluate();

        } catch (e) {
            reject(e.toString());
        }
    });
}
