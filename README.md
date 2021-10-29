# puppeteer-extends
[![License][]](https://opensource.org/licenses/Apache-2.0)
[![Build Status]](https://github.com/devalexanderdaza/puppeteer-extends/actions/workflows/ci.yml)
[![NPM Package]](https://npmjs.org/package/puppeteer-extends)
[![semantic-release]](https://github.com/semantic-release/semantic-release)

[License]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[Build Status]: https://github.com/devalexanderdaza/puppeteer-extends/actions/workflows/ci.yml/badge.svg
[NPM Package]: https://img.shields.io/npm/v/puppeteer-extends.svg
[semantic-release]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

> Easy manage and instance a puppeteer using a singleton pattern. Minimal configuration implemented for install and use.

## Install

``` shell
npm install puppeteer-extends
```

## Use

``` javascript
const { PuppeteerExtends, Logger } = require("puppeteer-extends");
const path = require("path");
const { Browser, Page } = require("puppeteer");

// Define your custom browser arguments
const customArguments = [
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

const main = async () => {
	// Set custom parameters on init browser instance
	const browser = await PuppeteerExtends.getBrowser({
		isHeadless: true,
		isDebug: false,
		customArguments: customArguments,
		userDataDir: puppeteerDataDirectory,
	});
	if (browser) {
		const page = await browser.newPage();
		
		// * An example of crawling a page with CloudFlare applied.
		Logger.debug("🚧  Crawling in progress...");
		
		const url = "https://github.com/devalexanderdaza";
		await PuppeteerExtends.goto(page, url);
		await page.screenshot({
			path: path.join(__dirname, "./tmp/puppeteer-extends/example-js.png"),
		});
		
		Logger.debug("🚧  Crawling is complete.");
		Logger.debug("🚧  Closing page...");
		PuppeteerExtends.closePage(page);
		Logger.debug("🚧  Exit the Puppeteer...");
		PuppeteerExtends.closeBrowser(browser);
	}
};

main().then();
```

## TypeScript support

``` typescript
import { PuppeteerExtends, Logger } from 'puppeteer-extends';
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
```
