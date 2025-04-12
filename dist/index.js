"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.PuppeteerExtends = void 0;
const browser_1 = require("./browser");
const navigation_1 = require("./navigation");
const utils_1 = require("./utils");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return utils_1.Logger; } });
/**
 * PuppeteerExtends API
 * Maintains backward compatibility with original API while providing new capabilities
 */
const PuppeteerExtends = {
    /**
     * Get or create a browser instance
     * @param options Browser configuration options
     */
    getBrowser: (options) => browser_1.BrowserFactory.getBrowser(options),
    /**
     * Close a specific browser instance
     * @param instanceId Browser instance ID (default: "default")
     */
    closeBrowser: (instanceId) => browser_1.BrowserFactory.closeBrowser(instanceId),
    /**
     * Close all browser instances
     */
    closeAllBrowsers: () => browser_1.BrowserFactory.closeAllBrowsers(),
    /**
     * Navigate to URL with CloudFlare protection bypass
     * @param page Puppeteer Page instance
     * @param targetUrl URL to navigate to
     * @param options Navigation options
     */
    goto: (page, targetUrl, options) => navigation_1.NavigationService.goto(page, targetUrl, options),
    /**
     * Close a page
     * @param page Puppeteer Page instance
     */
    closePage: (page) => navigation_1.NavigationService.closePage(page),
    /**
     * Wait for navigation to complete
     * @param page Puppeteer Page instance
     * @param options Navigation options
     */
    waitForNavigation: (page, options) => navigation_1.NavigationService.waitForNavigation(page, options),
    /**
     * Wait for selector to be visible on page
     * @param page Puppeteer Page instance
     * @param selector CSS selector to wait for
     * @param timeout Maximum wait time in milliseconds
     */
    waitForSelector: (page, selector, timeout) => navigation_1.NavigationService.waitForSelector(page, selector, timeout),
    /**
     * Default browser arguments
     */
    DEFAULT_BROWSER_ARGS: browser_1.DEFAULT_BROWSER_ARGS,
};
exports.PuppeteerExtends = PuppeteerExtends;
// Default export for CommonJS compatibility
exports.default = PuppeteerExtends;
//# sourceMappingURL=index.js.map