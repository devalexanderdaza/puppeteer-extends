# puppeteer-extends
[![License][]](https://opensource.org/licenses/Apache-2.0)
[![Build Status]](https://github.com/devalexanderdaza/puppeteer-extends/actions/workflows/ci.yml)
[![NPM Package]](https://npmjs.org/package/puppeteer-extends)
[![Code Coverage]](https://codecov.io/gh/devalexanderdaza/puppeteer-extends)
[![semantic-release]](https://github.com/semantic-release/semantic-release)

[License]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[Build Status]: https://github.com/devalexanderdaza/puppeteer-extends/actions/workflows/ci.yml/badge.svg
[NPM Package]: https://img.shields.io/npm/v/puppeteer-extends.svg
[Code Coverage]: https://codecov.io/gh/devalexanderdaza/puppeteer-extends/branch/master/graph/badge.svg
[semantic-release]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

> Brief and fresh sentence fragment

## Install

``` shell
npm install puppeteer-extends
```

## Use

``` typescript
import { PuppeteerExtends, Logger } from 'puppeteer-extends';

const main = async () => {
    const browser = await PuppeteerExtends.getBrowser({ isHeadless: true });
    if (browser) {
        const page = await browser.newPage();

        // * An example of crawling a page with CloudFlare applied.
        Logger.debug('🚧  Crawling in progress...');

        const url = 'https://github.com/devalexanderdaza';
        await PuppeteerExtends.goto(page, url);
        await page.screenshot({ path: 'devalexanderdaza-github-screenshot.png' });

        Logger.debug('🚧  Crawling is complete.');
        Logger.debug('🚧  Exit the Puppeteer...');
        await browser.close();
    }
}

main().then(r => {});
```

## Related

TODO

## Acknowledgments

TODO
