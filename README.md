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

## Plugin System

puppeteer-extends v1.7.0 introduces a powerful plugin system that allows extending functionality through lifecycle hooks:

```typescript
import { PuppeteerExtends, StealthPlugin, ProxyPlugin } from 'puppeteer-extends';

// Register stealth plugin for improved anti-bot protection
await PuppeteerExtends.registerPlugin(new StealthPlugin({
  hideWebDriver: true,
  hideChromeRuntime: true
}));

// Register proxy rotation plugin
await PuppeteerExtends.registerPlugin(new ProxyPlugin({
  proxies: [
    { host: '123.45.67.89', port: 8080, username: 'user', password: 'pass' },
    { host: '98.76.54.32', port: 8080 },
  ],
  rotationStrategy: 'sequential',
  rotateOnNavigation: true,
  rotateOnError: true
}));

// Continue with normal usage - plugins will be active
const browser = await PuppeteerExtends.getBrowser();
const page = await browser.newPage();
// ...
```

### Built-in Plugins

| Plugin | Description |
|--------|-------------|
| `StealthPlugin` | Enhances anti-bot detection protection |
| `ProxyPlugin` | Provides proxy rotation with multiple strategies |

### Creating Custom Plugins

You can create custom plugins by implementing the `PuppeteerPlugin` interface:

```typescript
import { PuppeteerPlugin, PluginContext } from 'puppeteer-extends';

class MyCustomPlugin implements PuppeteerPlugin {
  name = 'my-custom-plugin';
  
  // Called when plugin is registered
  async initialize(options?: any): Promise<void> {
    console.log('Plugin initialized with options:', options);
  }
  
  // Called before browser launch
  async onBeforeBrowserLaunch(options: any, context: PluginContext): Promise<any> {
    // Modify launch options if needed
    return {
      ...options,
      args: [...options.args, '--disable-features=site-per-process']
    };
  }
  
  // Called when a new page is created
  async onPageCreated(page: Page, context: PluginContext): Promise<void> {
    await page.evaluateOnNewDocument(() => {
      // Execute code in the page context
    });
  }
  
  // Called before navigation
  async onBeforeNavigation(page: Page, url: string, options: any, context: PluginContext): Promise<void> {
    console.log(`Navigating to: ${url}`);
  }
  
  // Handle errors
  async onError(error: Error, context: PluginContext): Promise<boolean> {
    console.error('Plugin caught error:', error);
    return false; // Return true if error was handled
  }
  
  // Called when plugin is unregistered
  async cleanup(): Promise<void> {
    console.log('Plugin cleanup');
  }
}

// Register the custom plugin
await PuppeteerExtends.registerPlugin(new MyCustomPlugin(), { 
  customOption: 'value' 
});
```

### Available Plugin Hooks

| Hook | Description |
|------|-------------|
| `initialize` | Called when plugin is registered |
| `cleanup` | Called when plugin is unregistered |
| `onBeforeBrowserLaunch` | Before browser instance is created |
| `onAfterBrowserLaunch` | After browser instance is created |
| `onBeforeBrowserClose` | Before browser instance is closed |
| `onPageCreated` | When a new page is created |
| `onBeforePageClose` | Before a page is closed |
| `onBeforeNavigation` | Before navigation to a URL |
| `onAfterNavigation` | After navigation completes (success or failure) |
| `onError` | When an error occurs in any operation |

## Session Management

puppeteer-extends v1.7.0 introduces powerful session management capabilities, allowing you to persist cookies, localStorage, and other browser state between runs:

```typescript
import { PuppeteerExtends, SessionManager } from 'puppeteer-extends';

// Create a session manager
const sessionManager = new SessionManager({
  name: 'my-session',
  sessionDir: './sessions',
  persistCookies: true,
  persistLocalStorage: true,
  domains: ['example.com'] // Only store cookies for these domains
});

// Get browser and create page
const browser = await PuppeteerExtends.getBrowser();
const page = await browser.newPage();

// Apply session data to page (cookies, localStorage, etc.)
await sessionManager.applySession(page);

// Navigate somewhere
await PuppeteerExtends.goto(page, 'https://example.com/login');

// Perform login or other actions that modify session
await page.type('#username', 'myuser');
await page.type('#password', 'mypassword');
await page.click('#login-button');

// Wait for login to complete
await PuppeteerExtends.waitForNavigation(page);

// Extract and save session data (cookies, localStorage, etc.)
await sessionManager.extractSession(page);

// Next time you run your script, the session will be loaded automatically
```

### Using the SessionPlugin

For more integrated session management, use the built-in SessionPlugin:

```typescript
import { PuppeteerExtends } from 'puppeteer-extends';
import { SessionPlugin } from 'puppeteer-extends/plugins';

// Register the session plugin
await PuppeteerExtends.registerPlugin(new SessionPlugin({
  name: 'my-session',
  persistCookies: true,
  persistLocalStorage: true,
  extractAfterNavigation: true, // Auto-save after each navigation
  applyBeforeNavigation: true   // Auto-apply before each navigation
}));

// Session management is now automatic
const browser = await PuppeteerExtends.getBrowser();
const page = await browser.newPage();

// Navigate anywhere - session will be applied/extracted automatically
await PuppeteerExtends.goto(page, 'https://example.com');
```

### Session Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sessionDir` | string | `"./tmp/puppeteer-extends/sessions"` | Directory to store session files |
| `name` | string | `"default"` | Session name (used for file name) |
| `persistCookies` | boolean | `true` | Whether to save/load cookies |
| `persistLocalStorage` | boolean | `true` | Whether to save/load localStorage |
| `persistSessionStorage` | boolean | `false` | Whether to save/load sessionStorage |
| `persistUserAgent` | boolean | `true` | Whether to save/load userAgent |
| `domains` | string[] | `undefined` | Domains to include when saving cookies |
| `extractAfterNavigation`* | boolean | `true` | Save session after each navigation |
| `applyBeforeNavigation`* | boolean | `true` | Apply session before each navigation |

*Only available in SessionPlugin

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