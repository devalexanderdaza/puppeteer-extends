"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptchaType = exports.CaptchaService = exports.PuppeteerEvents = exports.Events = exports.SessionManager = exports.Logger = exports.PuppeteerExtends = void 0;
const browser_1 = require("./browser");
const navigation_1 = require("./navigation");
const utils_1 = require("./utils");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return utils_1.Logger; } });
const plugins_1 = require("./plugins");
const session_1 = require("./session");
Object.defineProperty(exports, "SessionManager", { enumerable: true, get: function () { return session_1.SessionManager; } });
const events_1 = require("./events");
Object.defineProperty(exports, "Events", { enumerable: true, get: function () { return events_1.Events; } });
Object.defineProperty(exports, "PuppeteerEvents", { enumerable: true, get: function () { return events_1.PuppeteerEvents; } });
const captcha_1 = require("./captcha");
Object.defineProperty(exports, "CaptchaType", { enumerable: true, get: function () { return captcha_1.CaptchaType; } });
Object.defineProperty(exports, "CaptchaService", { enumerable: true, get: function () { return captcha_1.CaptchaService; } });
/**
 * PuppeteerExtends API
 * Maintains backward compatibility with original API while providing new capabilities
 */
const PuppeteerExtends = {
    /**
     * Logger instance
     */
    Logger: utils_1.Logger,
    /**
     * Session manager instance
     */
    SessionManager: session_1.SessionManager,
    /**
     * Navigation service instance
     */
    NavigationService: navigation_1.NavigationService,
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
     * Register a plugin
     * @param plugin Plugin implementation
     * @param options Plugin options
     */
    registerPlugin: (plugin, options) => plugins_1.PluginManager.registerPlugin(plugin, options),
    /**
     * Unregister a plugin
     * @param pluginName Plugin name
     */
    unregisterPlugin: (pluginName) => plugins_1.PluginManager.unregisterPlugin(pluginName),
    /**
     * Get a plugin by name
     * @param pluginName Plugin name
     */
    getPlugin: (pluginName) => plugins_1.PluginManager.getPlugin(pluginName),
    /**
     * Get all registered plugins
     */
    getAllPlugins: () => plugins_1.PluginManager.getAllPlugins(),
    /**
     * Default browser arguments
     */
    DEFAULT_BROWSER_ARGS: browser_1.DEFAULT_BROWSER_ARGS,
};
exports.PuppeteerExtends = PuppeteerExtends;
// Default export for CommonJS compatibility
exports.default = PuppeteerExtends;
//# sourceMappingURL=index.js.map