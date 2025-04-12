"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationService = void 0;
const logger_1 = require("../utils/logger");
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
        const { waitUntil = ["load", "networkidle0"], isDebug = false, timeout = 30000, headers = {}, maxRetries = 1, retryDelay = 5000, } = options;
        let attempts = 0;
        while (attempts <= maxRetries) {
            try {
                if (isDebug) {
                    logger_1.Logger.debug(`🚧 Navigating to ${targetUrl} (attempt ${attempts + 1}/${maxRetries + 1})`);
                }
                // Reset request interception before setting it again
                await page.setRequestInterception(false);
                await page.setRequestInterception(true);
                // Handle requests and apply custom headers
                page.once("request", (request) => {
                    const overrides = {
                        headers: {
                            ...request.headers(),
                            ...headers,
                        },
                    };
                    try {
                        request.continue(overrides);
                    }
                    catch (e) {
                        // Request may have been handled already
                        if (isDebug) {
                            logger_1.Logger.debug(`🚧 Request continuation error: ${e instanceof Error ? e.message : String(e)}`);
                        }
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
                    logger_1.Logger.debug(`🚧 Successfully navigated to ${targetUrl}`);
                }
                return true;
            }
            catch (error) {
                attempts++;
                if (isDebug) {
                    logger_1.Logger.debug(`🚧 Navigation error: ${error instanceof Error ? error.message : String(error)}`);
                    if (attempts <= maxRetries) {
                        logger_1.Logger.debug(`🚧 Retrying in ${retryDelay}ms...`);
                    }
                }
                // Reset request interception if it failed
                try {
                    await page.setRequestInterception(false);
                }
                catch (e) {
                    // Ignore errors during cleanup
                }
                if (attempts <= maxRetries) {
                    // Wait before retrying
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                }
                else {
                    if (isDebug) {
                        logger_1.Logger.debug(`🚧 All navigation attempts failed for ${targetUrl}`);
                    }
                    return false;
                }
            }
        }
        return false;
    }
    /**
     * Close a page
     * @param page Puppeteer Page instance
     */
    static async closePage(page) {
        try {
            await page.close();
        }
        catch (error) {
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
            return false;
        }
    }
}
exports.NavigationService = NavigationService;
//# sourceMappingURL=navigation-service.js.map