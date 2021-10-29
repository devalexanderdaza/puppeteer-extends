// import { PuppeteerExtends, Logger } from 'puppeteer-extends';
import { PuppeteerExtends, Logger } from "../dist/index";
import path from "path";
import { Browser, Page } from "puppeteer";

// Define your custom browser arguments
const customArguments: string[] = [
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

// Folder of puppeteer store data
const puppeteerDataDirectory = path.join(__dirname, "./tmp/puppeteer-extends");

const main = async (): Promise<void> => {
  // Set custom parameters on init browser instance
  const browser: Browser | undefined = await PuppeteerExtends.getBrowser({
    isHeadless: true,
    isDebug: false,
    customArguments: customArguments,
    userDataDir: puppeteerDataDirectory,
  });
  if (browser) {
    const page: Page = await browser.newPage();

    // * An example of crawling a page with CloudFlare applied.
    Logger.debug("🚧  Crawling in progress...");

    const url: string = "https://github.com/devalexanderdaza";
    await PuppeteerExtends.goto(page, url);
    await page.screenshot({
      path: path.join(__dirname, "./tmp/puppeteer-extends/example.png"),
    });

    Logger.debug("🚧  Crawling is complete.");
    Logger.debug("🚧  Closing page...");
    PuppeteerExtends.closePage(page);
    Logger.debug("🚧  Exit the Puppeteer...");
    PuppeteerExtends.closeBrowser(browser);
  }
};

main().then();
