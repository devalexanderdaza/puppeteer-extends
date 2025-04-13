"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserFactory = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const path_1 = __importDefault(require("path"));
const browser_options_1 = require("./browser-options");
const logger_1 = require("../utils/logger");
const plugins_1 = require("../plugins");
const events_1 = require("../events");
/**
 * BrowserFactory manages multiple browser instances
 * Replaces the previous singleton pattern with a more flexible factory
 */
class BrowserFactory {
    /**
     * Initialize puppeteer-extra and plugins
     * @private
     */
    static initialize() {
        if (!this.initialized) {
            require("tls").DEFAULT_MIN_VERSION = "TLSv1";
            // Configure puppeteer-extra
            puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
            // @ts-ignore - Fix for EventEmitter warning
            puppeteer_extra_1.default.setMaxListeners = () => { };
            this.initialized = true;
        }
    }
    /**
     * Get browser instance by ID, creating it if necessary
     * @param options Browser configuration options
     */
    static async getBrowser(options = {}) {
        this.initialize();
        const instanceId = options.instanceId || "default";
        if (!this.instances.has(instanceId)) {
            this.instances.set(instanceId, await this.createBrowser(options));
        }
        const browser = this.instances.get(instanceId);
        if (!browser) {
            throw new Error(`Failed to get browser instance: ${instanceId}`);
        }
        return browser;
    }
    /**
     * Create a new browser instance
     * @param options Browser configuration options
     * @private
     */
    static async createBrowser(options) {
        const { isHeadless = true, isDebug = false, customArguments = browser_options_1.DEFAULT_BROWSER_ARGS, userDataDir = path_1.default.join(process.cwd(), "tmp/puppeteer-extends"), } = options;
        if (isDebug) {
            logger_1.Logger.debug(`🚧 Starting browser with instance ID: ${options.instanceId || "default"}`);
            logger_1.Logger.debug(`🚧 User data directory: ${userDataDir}`);
        }
        // Create plugin context
        const context = {
            options,
        };
        try {
            // Create launch options
            let launchOptions = {
                headless: isHeadless,
                // ignoreHTTPSErrors: true,
                args: ["--no-sandbox", "--disable-web-security", ...customArguments],
                // userDataDir,
                ignoreDefaultArgs: [],
                // slowMo: 10,
            };
            // Execute plugin hook before browser launch
            await plugins_1.PluginManager.executeHook("onBeforeBrowserLaunch", context, launchOptions);
            // Launch browser
            const browser = await puppeteer_extra_1.default.launch(launchOptions);
            if (isDebug) {
                logger_1.Logger.debug(`🚧 Browser successfully started`);
            }
            // Emit browser created event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.BROWSER_CREATED, {
                browser,
                instanceId: options.instanceId || "default",
                options,
            });
            // Update context with browser
            context.browser = browser;
            // Run plugin hook after browser launch
            await plugins_1.PluginManager.executeHook("onAfterBrowserLaunch", context, browser);
            // Extend newPage to support plugin hooks
            const originalNewPage = browser.newPage.bind(browser);
            // Override newPage method to run plugin hooks
            browser.newPage = async () => {
                const page = await originalNewPage();
                // Create page context for plugins
                const pageContext = {
                    browser,
                    page,
                    options,
                };
                // Emit page created event
                await events_1.Events.emitAsync(events_1.PuppeteerEvents.PAGE_CREATED, {
                    page,
                    browser,
                    instanceId: options.instanceId || "default",
                });
                // Execute plugin hook for page creation
                await plugins_1.PluginManager.executeHook("onPageCreated", pageContext, page);
                // Override close method to run plugin hooks
                const originalClose = page.close.bind(page);
                page.close = async (options) => {
                    // Emit page closing event
                    await events_1.Events.emitAsync(events_1.PuppeteerEvents.PAGE_CLOSED, {
                        page,
                        browser,
                        instanceId: options.instanceId || "default",
                    });
                    // Execute plugin hook before page close
                    await plugins_1.PluginManager.executeHook("onBeforePageClose", pageContext, page);
                    // Close the page
                    return originalClose(options);
                };
                // Set up error handling for page errors
                page.on("error", async (error) => {
                    // Emit page error event
                    await events_1.Events.emitAsync(events_1.PuppeteerEvents.PAGE_ERROR, {
                        error,
                        source: "page",
                        context: {
                            page,
                            browser,
                            instanceId: options.instanceId || "default",
                        },
                    });
                    // Execute error hook
                    await plugins_1.PluginManager.executeErrorHook(error, {
                        page,
                        browser,
                        options,
                    });
                });
                return page;
            };
            // Handle disconnection and cleanup
            browser.on("disconnected", async () => {
                if (isDebug) {
                    logger_1.Logger.debug(`🚧 Browser disconnected: ${options.instanceId || "default"}`);
                }
                // Emit browser closed event
                await events_1.Events.emitAsync(events_1.PuppeteerEvents.BROWSER_CLOSED, {
                    browser,
                    instanceId: options.instanceId || "default",
                    options,
                });
                // Execute plugin hook before browser disconnect
                await plugins_1.PluginManager.executeHook("onBeforeBrowserClose", context, browser);
                this.instances.delete(options.instanceId || "default");
            });
            return browser;
        }
        catch (error) {
            if (isDebug) {
                logger_1.Logger.debug(`🚧 Error launching browser: ${error instanceof Error ? error.message : String(error)}`);
            }
            // Emit browser error event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.BROWSER_ERROR, {
                error: error instanceof Error ? error : new Error(String(error)),
                source: "browser",
                context: { options },
            });
            // Execute error hook
            await plugins_1.PluginManager.executeErrorHook(error instanceof Error ? error : new Error(String(error)), context);
            throw new Error(`Failed to launch browser: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Close a specific browser instance
     * @param instanceId Browser instance ID
     */
    static async closeBrowser(instanceId = "default") {
        const browser = this.instances.get(instanceId);
        if (browser) {
            // Create context for plugin hooks
            const context = {
                browser,
                options: { instanceId },
            };
            // Emit browser closing event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.BROWSER_CLOSED, {
                browser,
                instanceId,
                options: { instanceId },
            });
            // Execute plugin hook before browser close
            await plugins_1.PluginManager.executeHook("onBeforeBrowserClose", context, browser);
            await browser.close();
            this.instances.delete(instanceId);
        }
    }
    /**
     * Close all browser instances
     */
    static async closeAllBrowsers() {
        for (const [id, browser] of this.instances.entries()) {
            // Create context for plugin hooks
            const context = {
                browser,
                options: { instanceId: id },
            };
            // Emit browser closing event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.BROWSER_CLOSED, {
                browser,
                instanceId: id,
                options: { instanceId: id },
            });
            // Execute plugin hook before browser close
            await plugins_1.PluginManager.executeHook("onBeforeBrowserClose", context, browser);
            await browser.close();
            this.instances.delete(id);
        }
    }
}
exports.BrowserFactory = BrowserFactory;
BrowserFactory.instances = new Map();
BrowserFactory.initialized = false;
//# sourceMappingURL=browser-factory.js.map