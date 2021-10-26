/**
 * @since 1.0.0
 */
import puppeteer, { Browser } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import cloudscraper from 'cloudscraper';
import { Logger } from './logger';

/**
 * * Manage browser instances with a singleton.
 * @since 1.0.0
 */
let browserSingleton: puppeteer.Browser | undefined;

interface IOptions {
  isHeadless?: boolean | undefined
  isDebug?: boolean | undefined
}

/**
 * * Returns the instance of a Puppeteer browser.
 * * If the browser is open, return the past browser instance.
 * @since 1.0.0
 */
export const getBrowser = async (options: IOptions) => {
  if (!browserSingleton) {
    // @ts-ignore
    browserSingleton = await init(options);
  }
  return browserSingleton
}

/**
 * * Define a puppeteer initializer
 * @param isHeadless
 * @param isDebug
 *
 * @since 1.0.0
 */
const init = async ({isHeadless = true, isDebug = true}): Promise<Browser | undefined> => {
  require('tls').DEFAULT_MIN_VERSION = 'TLSv1';

  if (isDebug) {
    Logger.debug(`🚧  Initial run in progress...`);
    Logger.debug(`🚧  Starting Headless Chrome...`);
    Logger.debug(`🚧  You can exit with Ctrl+C at any time.\n`);
  }

  try {
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
    ];

    const options = {
      args,
      headless: isHeadless,
      ignoreHTTPSErrors: true,
      userDataDir: './tmp',
    };

    const browser = await puppeteerExtra.launch(options);
    if (isDebug) Logger.debug(`🚧  Headless Chrome has been started.`);

    // @ts-ignore
    puppeteerExtra.setMaxListeners = () => {
    }

    // * Apply the stealth plug-in.
    puppeteerExtra.use(stealthPlugin());

    // @ts-ignore
    return browser;
  } catch (e) {
    if (isDebug) {
      Logger.debug(`🚧  Error occurred during headless chrome operation.`);
      Logger.debug(e);
    }
  }

  return undefined;
}

/**
 * * Go to that page using puppeteer.
 * * (with stealth mode applied)
 *
 * @since 1.0.0
 */
export const goto = async (
  page: puppeteer.Page,
  targetUrl: string,
  options: {
    waitUntil: string[],
    isDebug: boolean,
    timeout: number,
  } = {
    waitUntil: ['load', 'networkidle0'],
    isDebug: false,
    timeout: 1,
  },
): Promise<boolean> => {
  try {
    // * Get the imitation cookies.
    const hookHeaders: any = await getImitationCookie(targetUrl);
    await page.setRequestInterception(true);

    // * Anti Cloud Flare
    page.on('request', (request) => request.continue(hookHeaders));

    await page.goto(targetUrl, {
      // @ts-ignore
      waitUntil: options.waitUntil,
      timeout: options.timeout,
    });

    return true;
  } catch (e) {
    if (options.isDebug) {
      Logger.debug('An error occurred while connecting to the page.');
      Logger.debug('After 5 seconds, try accessing the page again.');
      Logger.debug(`Page with error: ${targetUrl}\n`);
    }

    await page.waitFor(5000);
    return false;
  }
}

/**
 * * Makes cookies look real.
 * @param url
 *
 * @since 1.0.0
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
  )
}
