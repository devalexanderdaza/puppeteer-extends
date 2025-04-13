"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationService = void 0;
const utils_1 = require("../utils");
const plugins_1 = require("../plugins");
const events_1 = require("../events");
/**
 * Navigation utilities for Puppeteer pages
 */
class NavigationService {
    /**
     * Navigate to a URL with CloudFlare protection bypass and retry mechanism
     * @param page Puppeteer Page instance
     * @param targetUrl URL to navigate to
     * @param options Navigation options
     */
    static async goto(page, targetUrl, options = {}) {
        const { waitUntil = [], isDebug = false, timeout = 0, 
        // headers = {},
        maxRetries = 1, retryDelay = 5000, } = options;
        // Create plugin context
        const context = {
            page,
            options,
        };
        let attempts = 0;
        while (attempts <= maxRetries) {
            try {
                if (isDebug) {
                    utils_1.Logger.debug(`🚧 Navigating to ${targetUrl} (attempt ${attempts + 1}/${maxRetries + 1})`);
                }
                // Emit navigation started event
                await events_1.Events.emitAsync(events_1.PuppeteerEvents.NAVIGATION_STARTED, {
                    page,
                    url: targetUrl,
                    options,
                });
                // Execute plugin hook before navigation
                await plugins_1.PluginManager.executeHook("onBeforeNavigation", context, page, targetUrl, options);
                // Reset request interception before setting it again
                await page.setRequestInterception(false);
                await page.setRequestInterception(true);
                // Handle requests and apply custom headers
                page.once("request", (request) => {
                    const overrides = {
                        headers: {
                            ...request.headers(),
                            // ...headers,
                        },
                    };
                    try {
                        request.continue(overrides);
                    }
                    catch (e) {
                        // Request may have been handled already
                        if (isDebug) {
                            utils_1.Logger.debug(`🚧 Request continuation error: ${e instanceof Error ? e : String(e)}`);
                        }
                        // TODO - Validate if this is the right way to handle this
                        // request.continue();
                    }
                });
                // Navigate to page
                await page.goto(targetUrl, {
                    waitUntil: waitUntil,
                    timeout,
                });
                // Reset request interception after navigation
                await page.setRequestInterception(false);
                if (isDebug) {
                    utils_1.Logger.debug(`🚧 Successfully navigated to ${targetUrl}`);
                }
                // Emit navigation succeeded event
                await events_1.Events.emitAsync(events_1.PuppeteerEvents.NAVIGATION_SUCCEEDED, {
                    page,
                    url: targetUrl,
                    options,
                });
                // Execute plugin hook after successful navigation
                await plugins_1.PluginManager.executeHook("onAfterNavigation", context, page, targetUrl, true);
                return true;
            }
            catch (error) {
                attempts++;
                if (isDebug) {
                    utils_1.Logger.debug(`🚧 Navigation error: ${error instanceof Error ? error : String(error)}`);
                    if (attempts <= maxRetries) {
                        utils_1.Logger.debug(`🚧 Retrying in ${retryDelay}ms...`);
                    }
                }
                // Emit navigation error event
                await events_1.Events.emitAsync(events_1.PuppeteerEvents.NAVIGATION_ERROR, {
                    error: error instanceof Error ? error : new Error(String(error)),
                    source: "navigation",
                    context: { page, url: targetUrl, options },
                });
                // Reset request interception if it failed
                try {
                    await page.setRequestInterception(false);
                }
                catch (e) {
                    // Ignore errors during cleanup
                }
                // Execute error hook and check if any plugin handled it
                const handled = await plugins_1.PluginManager.executeErrorHook(error instanceof Error ? error : new Error(String(error)), { ...context });
                // If error wasn't handled by any plugin, continue with retries
                if (!handled && attempts <= maxRetries) {
                    // Wait before retrying
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                }
                else if (!handled) {
                    if (isDebug) {
                        utils_1.Logger.debug(`🚧 All navigation attempts failed for ${targetUrl}`);
                    }
                    // Emit navigation failed event
                    await events_1.Events.emitAsync(events_1.PuppeteerEvents.NAVIGATION_FAILED, {
                        page,
                        url: targetUrl,
                        options,
                        error: error instanceof Error ? error : new Error(String(error)),
                    });
                    // Execute plugin hook after failed navigation
                    await plugins_1.PluginManager.executeHook("onAfterNavigation", context, page, targetUrl, false);
                    return false;
                }
                else {
                    // If a plugin handled the error, try again immediately if we have attempts left
                    if (attempts <= maxRetries) {
                        continue;
                    }
                    else {
                        await plugins_1.PluginManager.executeHook("onAfterNavigation", context, page, targetUrl, false);
                        return false;
                    }
                }
            }
        }
        // Execute plugin hook after all navigation attempts failed
        await plugins_1.PluginManager.executeHook("onAfterNavigation", context, page, targetUrl, false);
        // Emit navigation failed event
        await events_1.Events.emitAsync(events_1.PuppeteerEvents.NAVIGATION_FAILED, {
            page,
            url: targetUrl,
            options,
        });
        return false;
    }
    /**
     * Close a page
     * @param page Puppeteer Page instance
     */
    static async closePage(page) {
        // Create plugin context
        const context = {
            page,
        };
        try {
            // Execute plugin hook before page close
            await plugins_1.PluginManager.executeHook("onBeforePageClose", context, page);
            await page.close();
        }
        catch (error) {
            // Execute error hook
            await plugins_1.PluginManager.executeErrorHook(error instanceof Error ? error : new Error(String(error)), context);
            // Ignore errors during page closing
        }
    }
    /**
     * Wait for navigation to complete
     * @param page Puppeteer Page instance
     * @param options Navigation options
     */
    static async waitForNavigation(page, options = {}) {
        const { waitUntil = ["load", "networkidle0"], timeout = 30000 } = options;
        try {
            await page.waitForNavigation({
                waitUntil: waitUntil,
                timeout,
            });
            return true;
        }
        catch (error) {
            // Execute error hook
            await plugins_1.PluginManager.executeErrorHook(error instanceof Error ? error : new Error(String(error)), { page, options });
            // Emit navigation error event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.NAVIGATION_ERROR, {
                error: error instanceof Error ? error : new Error(String(error)),
                source: "waitForNavigation",
                context: { page, options },
            });
            return false;
        }
    }
    /**
     * Wait for selector to be visible on page
     * @param page Puppeteer Page instance
     * @param selector CSS selector to wait for
     * @param timeout Maximum wait time in milliseconds
     */
    static async waitForSelector(page, selector, timeout = 30000) {
        try {
            await page.waitForSelector(selector, { visible: true, timeout });
            return true;
        }
        catch (error) {
            // Execute error hook
            await plugins_1.PluginManager.executeErrorHook(error instanceof Error ? error : new Error(String(error)), { page, options: { selector, timeout } });
            // Emit error event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.ERROR, {
                error: error instanceof Error ? error : new Error(String(error)),
                source: "waitForSelector",
                context: { page, selector, timeout },
            });
            return false;
        }
    }
    /**
     * Get the current URL of the page
     * @param page Puppeteer Page instance
     */
    static getCurrentUrl(page) {
        return page.url();
    }
    /**
     * Get the current page title
     * @param page Puppeteer Page instance
     */
    static async getPageTitle(page) {
        return page.title();
    }
    /**
     * Click on a selector
     * @param page Puppeteer Page instance
     * @param selector CSS selector to click
     * @param options Click options
     */
    static async click(page, selector, options = {}) {
        const { delay = 0 } = options;
        try {
            await page.waitForSelector(selector, { visible: true });
            await page.click(selector, { delay });
        }
        catch (error) {
            // Execute error hook
            await plugins_1.PluginManager.executeErrorHook(error instanceof Error ? error : new Error(String(error)), { page, options: { selector, ...options } });
            // Emit error event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.ERROR, {
                error: error instanceof Error ? error : new Error(String(error)),
                source: "click",
                context: { page, selector, options },
            });
            throw error;
        }
    }
    /**
     * Type text into an input field
     * @param page Puppeteer Page instance
     * @param selector CSS selector of the input field
     * @param text Text to type
     * @param options Type options
     */
    static async type(page, selector, text, options = {}) {
        const { delay = 0 } = options;
        try {
            await page.waitForSelector(selector, { visible: true });
            await page.type(selector, text, { delay });
        }
        catch (error) {
            // Execute error hook
            await plugins_1.PluginManager.executeErrorHook(error instanceof Error ? error : new Error(String(error)), { page, options: { selector, text, ...options } });
            // Emit error event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.ERROR, {
                error: error instanceof Error ? error : new Error(String(error)),
                source: "type",
                context: { page, selector, text, options },
            });
            throw error;
        }
    }
    /**
     * Evaluate a function in the context of the page
     * @param page Puppeteer Page instance
     * @param fn Function to evaluate
     * @param args Arguments to pass to the function
     */
    static async evaluate(page, fn, ...args) {
        try {
            return await page.evaluate(fn, ...args);
        }
        catch (error) {
            // Execute error hook
            await plugins_1.PluginManager.executeErrorHook(error instanceof Error ? error : new Error(String(error)), { page, options: { fn, args } });
            // Emit error event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.ERROR, {
                error: error instanceof Error ? error : new Error(String(error)),
                source: "evaluate",
                context: { page, fn, args },
            });
            throw error;
        }
    }
    /**
     * Get the page content
     * @param page Puppeteer Page instance
     */
    static async getContent(page) {
        try {
            return await page.content();
        }
        catch (error) {
            // Execute error hook
            await plugins_1.PluginManager.executeErrorHook(error instanceof Error ? error : new Error(String(error)), { page, options: {} });
            // Emit error event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.ERROR, {
                error: error instanceof Error ? error : new Error(String(error)),
                source: "getContent",
                context: { page, options: {} },
            });
            throw error;
        }
    }
}
exports.NavigationService = NavigationService;
//# sourceMappingURL=navigation-service.js.map