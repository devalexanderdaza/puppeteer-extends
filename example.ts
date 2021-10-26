import { Puppeteer, Logger } from "./src/index";

const main = async () => {
    const browser = await Puppeteer.getBrowser({ isHeadless: true })
    if (browser) {
        const page = await browser.newPage()

        // * An example of crawling a page with CloudFlare applied.
        Logger.debug('🚧  Crawling in progress...')

        const url = 'https://github.com'
        await Puppeteer.goto(page, url)
        await page.screenshot({ path: 'example.png' })

        Logger.debug('🚧  Crawling is complete.')
        Logger.debug('🚧  Exit the Puppeteer...')
        await browser.close()
    }
}

main().then(r => {});
