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
        try {
            const browser = await puppeteer_extra_1.default.launch({
                headless: isHeadless,
                ignoreHTTPSErrors: true,
                args: customArguments,
                userDataDir,
                defaultViewport: null,
                slowMo: 10,
            });
            if (isDebug) {
                logger_1.Logger.debug(`🚧 Browser successfully started`);
            }
            // Handle disconnection and cleanup
            browser.on("disconnected", () => {
                if (isDebug) {
                    logger_1.Logger.debug(`🚧 Browser disconnected: ${options.instanceId || "default"}`);
                }
                this.instances.delete(options.instanceId || "default");
            });
            return browser;
        }
        catch (error) {
            if (isDebug) {
                logger_1.Logger.debug(`🚧 Error launching browser: ${error instanceof Error ? error.message : String(error)}`);
            }
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
            await browser.close();
            this.instances.delete(instanceId);
        }
    }
    /**
     * Close all browser instances
     */
    static async closeAllBrowsers() {
        for (const [id, browser] of this.instances.entries()) {
            await browser.close();
            this.instances.delete(id);
        }
    }
}
exports.BrowserFactory = BrowserFactory;
BrowserFactory.instances = new Map();
BrowserFactory.initialized = false;
//# sourceMappingURL=browser-factory.js.map