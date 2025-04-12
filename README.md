# puppeteer-extends

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://github.com/devalexanderdaza/puppeteer-extends/actions/workflows/ci.yml/badge.svg)](https://github.com/devalexanderdaza/puppeteer-extends/actions/workflows/ci.yml)
[![NPM Package](https://img.shields.io/npm/v/puppeteer-extends.svg)](https://npmjs.org/package/puppeteer-extends)

> Modern, factory-based management for Puppeteer with advanced navigation features. Ideal for web scraping, testing, and automation.

## Features

- 🏭 **Browser Factory** - Multiple browser instances with intelligent reuse
- 🧭 **Enhanced Navigation** - CloudFlare bypass, retry mechanisms, and more
- 📝 **TypeScript Support** - Full type definitions for better DX
- 🔄 **Singleton Compatibility** - Maintains backward compatibility
- 🛡️ **Stealth Mode** - Integrated puppeteer-extra-plugin-stealth

## Installation

```bash
pnpm install puppeteer-extends
```

## Basic Usage

```typescript
import { PuppeteerExtends, Logger } from 'puppeteer-extends';
import path from 'path';

const main = async () => {
  // Get browser instance with options
  const browser = await PuppeteerExtends.getBrowser({
    isHeadless: true,
    isDebug: true
  });
  
  // Create new page
  const page = await browser.newPage();
  
  // Navigate with enhanced features (CloudFlare bypass, retries)
  await PuppeteerExtends.goto(page, 'https://example.com', {
    maxRetries: 2,
    timeout: 30000
  });
  
  // Take screenshot
  await page.screenshot({ 
    path: path.join(__dirname, 'screenshot.png') 
  });
  
  // Clean up
  await PuppeteerExtends.closePage(page);
  await PuppeteerExtends.closeBrowser();
};

main().catch(console.error);
```

## Multiple Browser Instances

```typescript
import { PuppeteerExtends } from 'puppeteer-extends';

const main = async () => {
  // Create two browser instances with different configurations
  const mainBrowser = await PuppeteerExtends.getBrowser({
    instanceId: 'main',
    isHeadless: true
  });
  
  const proxyBrowser = await PuppeteerExtends.getBrowser({
    instanceId: 'proxy',
    isHeadless: true,
    customArguments: [
      '--proxy-server=http://my-proxy.com:8080',
      '--no-sandbox'
    ]
  });
  
  // Work with both browsers
  const mainPage = await mainBrowser.newPage();
  const proxyPage = await proxyBrowser.newPage();
  
  // Clean up specific browser
  await PuppeteerExtends.closeBrowser('proxy');
  
  // Or close all browsers at once
  await PuppeteerExtends.closeAllBrowsers();
};
```

## Advanced Navigation Features

```typescript
import { PuppeteerExtends } from 'puppeteer-extends';

const scrape = async () => {
  const browser = await PuppeteerExtends.getBrowser();
  const page = await browser.newPage();
  
  // Navigation with retries and custom options
  const success = await PuppeteerExtends.goto(page, 'https://example.com', {
    waitUntil: ['networkidle0'],
    timeout: 60000,
    maxRetries: 3,
    retryDelay: 5000,
    isDebug: true
  });
  
  if (success) {
    // Wait for specific element with timeout
    const elementVisible = await PuppeteerExtends.waitForSelector(
      page, 
      '.content-loaded', 
      10000
    );
    
    if (elementVisible) {
      // Extract data
      const data = await page.evaluate(() => {
        return {
          title: document.title,
          content: document.querySelector('.content')?.textContent
        };
      });
      
      console.log('Scraped data:', data);
    }
  }
  
  await PuppeteerExtends.closePage(page);
  await PuppeteerExtends.closeBrowser();
};
```

## Customizing Logger

```typescript
import { Logger } from 'puppeteer-extends';
import path from 'path';

// Set custom log directory
Logger.configure(path.join(__dirname, 'custom-logs'));

// Use logger
Logger.info('Starting browser');
Logger.debug('Debug information');
Logger.warn('Warning message');
Logger.error('Error occurred', new Error('Something went wrong'));
```

## API Reference

### PuppeteerExtends

| Method | Description |
|--------|-------------|
| `getBrowser(options?)` | Get or create browser instance |
| `closeBrowser(instanceId?)` | Close specific browser |
| `closeAllBrowsers()` | Close all browser instances |
| `goto(page, url, options?)` | Navigate to URL with enhanced features |
| `waitForNavigation(page, options?)` | Wait for navigation to complete |
| `waitForSelector(page, selector, timeout?)` | Wait for element to be visible |
| `closePage(page)` | Close page safely |

### BrowserOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `isHeadless` | boolean | `true` | Launch browser in headless mode |
| `isDebug` | boolean | `false` | Enable debug logging |
| `customArguments` | string[] | `DEFAULT_BROWSER_ARGS` | Custom browser launch arguments |
| `userDataDir` | string | `./tmp/puppeteer-extends` | User data directory path |
| `instanceId` | string | `"default"` | Browser instance identifier |

### NavigationOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `waitUntil` | string[] | `["load", "networkidle0"]` | Navigation completion events |
| `timeout` | number | `30000` | Navigation timeout (ms) |
| `maxRetries` | number | `1` | Maximum retry attempts |
| `retryDelay` | number | `5000` | Delay between retries (ms) |
| `isDebug` | boolean | `false` | Enable debug logging |
| `headers` | object | `{}` | Custom request headers |

## Testing

```bash
# Run all tests
pnpm run test

# Run with coverage
pnpm run test:coverage

# Run in watch mode
pnpm run test:watch
```

## License

[Apache-2.0](https://opensource.org/licenses/Apache-2.0)