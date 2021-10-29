// const { PuppeteerExtends, Logger } = require("puppeteer-extends");
const { PuppeteerExtends, Logger } = require("../dist/index");

const main = async () => {
	const browser = await PuppeteerExtends.getBrowser({ isHeadless: true });
	if (browser) {
		const page = await browser.newPage();
		
		// * An example of crawling a page with CloudFlare applied.
		Logger.debug("🚧  Crawling in progress...");
		
		const url = "https://github.com/devalexanderdaza";
		await PuppeteerExtends.goto(page, url);
		await page.screenshot({ path: "devalexanderdaza-github-screenshot.png" });
		
		Logger.debug("🚧  Crawling is complete.");
		Logger.debug("🚧  Exit the Puppeteer...");
		await browser.close();
	}
};

main().then((r) => {});
