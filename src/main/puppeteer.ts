/**
 * @since 1.0.0
 */
import puppeteer, { Browser, Page } from "puppeteer";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import cloudscraper from "cloudscraper";
import { Logger } from "./logger";
import path from "path";

/**
 * Manage browser instances with a singleton.
 */
let browserSingleton: puppeteer.Browser | undefined;

/**
 * Custom browser arguments
 * @since 1.4.0
 */
const args: string[] = [
    "--no-sandbox",
    "--disable-web-security",
    "--disable-setuid-sandbox",
    "--aggressive-cache-discard",
    "--disable-cache",
    "--disable-infobars",
    "--disable-application-cache",
    "--window-position=0,0",
    "--disable-offline-load-stale-cache",
    "--disk-cache-size=0",
    "--disable-background-networking",
    "--disable-default-apps",
    "--disable-extensions",
    "--disable-sync",
    "--disable-translate",
    "--hide-scrollbars",
    "--metrics-recording-only",
    "--mute-audio",
    "--no-first-run",
    "--safebrowsing-disable-auto-update",
    "--ignore-certificate-errors",
    "--ignore-ssl-errors",
    "--ignore-certificate-errors-spki-list",
];

/**
 * Browser initializer options interface
 */
interface IOptions {
    isHeadless?: boolean | undefined;
    isDebug?: boolean | undefined;
    customArguments?: string[] | undefined;
    userDataDir?: string;
}

/**
 * Returns the instance of a Puppeteer browser.
 * @ignore
 */
export const getBrowser = async (
    options: IOptions
): Promise<Browser | undefined> => {
    if (!browserSingleton) {
        browserSingleton = await init(options);
    }
    return browserSingleton;
};

/**
 * Define a puppeteer initializer
 * @ignore
 */
const init = async ({
    isHeadless = true,
    isDebug = false,
    customArguments = args,
    userDataDir = path.join(__dirname, "../tmp/puppeteer-extends")
}): Promise<Browser | undefined> => {
    require("tls").DEFAULT_MIN_VERSION = "TLSv1";
    if (isDebug) {
        Logger.debug(`🚧  Initial run in progress...`);
        Logger.debug(`🚧  Starting Headless Chrome...`);
        Logger.debug(`🚧  You can exit with Ctrl+C at any time.\n`);
    }
    try {
        const options = {
            customArguments,
            headless: isHeadless,
            ignoreHTTPSErrors: true,
            userDataDir: userDataDir,
            defaultViewport: null,
            slowMo: 10,
        };
        const browser = await puppeteerExtra.launch(options);
        if (isDebug) Logger.debug(`🚧  Headless Chrome has been started.`);

        // @ts-ignore
        puppeteerExtra.setMaxListeners = () => {
        };

        puppeteerExtra.use(stealthPlugin());
        return browser;
    } catch (e) {
        if (isDebug) {
            Logger.debug(`🚧  Error occurred during headless chrome operation.`);
            Logger.debug(e);
        }
    }
    return undefined;
};

/**
 * Go to that page using puppeteer.
 * @since 1.0.0
 */
export const goto = async (
    page: puppeteer.Page,
    targetUrl: string,
    options: {
        waitUntil: string[];
        isDebug: boolean;
        timeout: number;
    } = {
        waitUntil: ["load", "networkidle0"],
        isDebug: false,
        timeout: 1,
    }
): Promise<boolean> => {
    try {
        // * Get the imitation cookies.
        const hookHeaders: any = await getImitationCookie(targetUrl);
        await page.setRequestInterception(true);

        // * Anti Cloud Flare
        page.on("request", (request) => request.continue(hookHeaders));

        await page.goto(targetUrl, {
            // @ts-ignore
            waitUntil: options.waitUntil,
            timeout: options.timeout,
        });

        return true;
    } catch (e) {
        if (options.isDebug) {
            Logger.debug("An error occurred while connecting to the page.");
            Logger.debug("After 5 seconds, try accessing the page again.");
            Logger.debug(`Page with error: ${targetUrl}\n`);
        }

        await page.waitFor(5000);
        return false;
    }
};

/**
 * Close page, not browser
 * @since 1.4.0
 * @param page
 */
export const closePage = (page: puppeteer.Page): void => {
    page.close().then();
}

/**
 * Close browser and all pages
 * @since 1.4.0
 * @param browser
 */
export const closeBrowser = (browser: Browser): void => {
    browser.close().then();
}

/**
 * Makes cookies look real.
 * @ignore
 */
export const getImitationCookie = (url) => {
    return new Promise((resolve, reject) =>
        // @ts-ignore
        cloudscraper.get(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(response.request.headers);
            }
        })
    );
};
