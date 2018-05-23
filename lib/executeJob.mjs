import { defaultLanguage, viewport } from './config';
import vm from 'vm';
import { BufferedLogger } from './bufferedLogger';
import * as shared from './shared';

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
    // const store = new ResultStore();
    let error = null;
    let page;

    try {
        page = await createPage(browser, bufLog);
        const moduleCode = wrapAsyncIIFE(code);

        await runCode(moduleCode, vars, page, bufLog, modules);
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
        results: {},
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

async function linker(logger, modules, specifier, referencingModule) {
    logger.debug(`Linking module ${specifier} to ${referencingModule.url} (Available: ${Object.keys(modules)})`);
    if (specifier in modules) {
        return new vm.Module(modules[specifier], { context: referencingModule.context, url: moduleUrl(`./puppet-master/module/${specifier}`) });
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
    const ____startTS = new Date();
    
    try {
        ${code}
    
    } catch (e) {
        logger.error(e.toString());
        ____reject(e.toString());
        
    } finally {
        logger.info(format("Code took %dms to execute.", new Date() - ____startTS));
        
        ____resolve();
    }
})();
`;
}

async function runCode(moduleCode, vars, page, bufLog, modules) {
    await new Promise(async (resolve, reject) => {
        try {
            const context = vm.createContext({
                ____resolve: resolve,
                ____reject: reject,
                console: bufLog,
                logger: bufLog,
                page,
                vars,
                ...shared,
            });
            const module = new vm.Module(moduleCode, { context, url: moduleUrl("./puppet-master/code") });

            await module.link((s, r) => linker(bufLog, modules, s, r));
            module.instantiate();
            await module.evaluate();

        } catch (e) {
            reject(e.toString());
        }
    });
}