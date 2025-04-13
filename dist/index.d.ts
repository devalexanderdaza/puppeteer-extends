/**
 * puppeteer-extends
 * Easy manage and instance puppeteer browsers using a factory pattern
 *
 * @since 1.7.0
 */
import { Page } from "puppeteer";
import { BrowserOptions } from "./browser";
import { NavigationService, NavigationOptions } from "./navigation";
import { Logger } from "./utils";
import { PuppeteerPlugin, PluginContext } from "./plugins";
import { SessionManager, SessionOptions, SessionData } from "./session";
import { Events, PuppeteerEvents } from "./events";
import { CaptchaType, CaptchaSolution, CaptchaOptions, CaptchaService } from "./captcha";
/**
 * PuppeteerExtends API
 * Maintains backward compatibility with original API while providing new capabilities
 */
declare const PuppeteerExtends: {
    /**
     * Logger instance
     */
    Logger: typeof Logger;
    /**
     * Session manager instance
     */
    SessionManager: typeof SessionManager;
    /**
     * Navigation service instance
     */
    NavigationService: typeof NavigationService;
    /**
     * Get or create a browser instance
     * @param options Browser configuration options
     */
    getBrowser: (options?: BrowserOptions) => Promise<import("puppeteer").Browser>;
    /**
     * Close a specific browser instance
     * @param instanceId Browser instance ID (default: "default")
     */
    closeBrowser: (instanceId?: string) => Promise<void>;
    /**
     * Close all browser instances
     */
    closeAllBrowsers: () => Promise<void>;
    /**
     * Navigate to URL with CloudFlare protection bypass
     * @param page Puppeteer Page instance
     * @param targetUrl URL to navigate to
     * @param options Navigation options
     */
    goto: (page: Page, targetUrl: string, options?: NavigationOptions) => Promise<boolean>;
    /**
     * Close a page
     * @param page Puppeteer Page instance
     */
    closePage: (page: Page) => Promise<void>;
    /**
     * Wait for navigation to complete
     * @param page Puppeteer Page instance
     * @param options Navigation options
     */
    waitForNavigation: (page: Page, options?: Pick<NavigationOptions, "waitUntil" | "timeout">) => Promise<boolean>;
    /**
     * Wait for selector to be visible on page
     * @param page Puppeteer Page instance
     * @param selector CSS selector to wait for
     * @param timeout Maximum wait time in milliseconds
     */
    waitForSelector: (page: Page, selector: string, timeout?: number) => Promise<boolean>;
    /**
     * Register a plugin
     * @param plugin Plugin implementation
     * @param options Plugin options
     */
    registerPlugin: (plugin: PuppeteerPlugin, options?: Record<string, any>) => Promise<void>;
    /**
     * Unregister a plugin
     * @param pluginName Plugin name
     */
    unregisterPlugin: (pluginName: string) => Promise<boolean>;
    /**
     * Get a plugin by name
     * @param pluginName Plugin name
     */
    getPlugin: (pluginName: string) => PuppeteerPlugin | undefined;
    /**
     * Get all registered plugins
     */
    getAllPlugins: () => PuppeteerPlugin[];
    /**
     * Default browser arguments
     */
    DEFAULT_BROWSER_ARGS: string[];
};
export { PuppeteerExtends, Logger, SessionManager, Events, PuppeteerEvents, CaptchaService, CaptchaType, };
export { BrowserOptions, NavigationOptions, PuppeteerPlugin, PluginContext, SessionOptions, SessionData, CaptchaOptions, CaptchaSolution, };
export default PuppeteerExtends;
