/**
 * puppeteer-extends
 * Easy manage and instance puppeteer browsers using a factory pattern
 *
 * @since 1.7.0
 */
import { Page } from "puppeteer";
import {
  BrowserFactory,
  BrowserOptions,
  DEFAULT_BROWSER_ARGS,
} from "./browser";
import { NavigationService, NavigationOptions } from "./navigation";
import { Logger } from "./utils";
import { PluginManager, PuppeteerPlugin, PluginContext } from "./plugins";
import { SessionManager, SessionOptions, SessionData } from "./session";
import { Events, PuppeteerEvents, EventEmitter } from "./events";
import { 
  CaptchaType, 
  CaptchaSolution, 
  CaptchaOptions, 
  CaptchaHelper, 
  CaptchaService 
} from "./captcha";

/**
 * PuppeteerExtends API
 * Maintains backward compatibility with original API while providing new capabilities
 */
const PuppeteerExtends = {
  /**
   * Logger instance
   */
  Logger,
  /**
   * Session manager instance
   */
  SessionManager,
  /**
   * Navigation service instance
   */
  NavigationService,

  /**
   * Get or create a browser instance
   * @param options Browser configuration options
   */
  getBrowser: (options?: BrowserOptions) => BrowserFactory.getBrowser(options),

  /**
   * Close a specific browser instance
   * @param instanceId Browser instance ID (default: "default")
   */
  closeBrowser: (instanceId?: string) =>
    BrowserFactory.closeBrowser(instanceId),

  /**
   * Close all browser instances
   */
  closeAllBrowsers: () => BrowserFactory.closeAllBrowsers(),

  /**
   * Navigate to URL with CloudFlare protection bypass
   * @param page Puppeteer Page instance
   * @param targetUrl URL to navigate to
   * @param options Navigation options
   */
  goto: (page: Page, targetUrl: string, options?: NavigationOptions) =>
    NavigationService.goto(page, targetUrl, options),

  /**
   * Close a page
   * @param page Puppeteer Page instance
   */
  closePage: (page: Page) => NavigationService.closePage(page),

  /**
   * Wait for navigation to complete
   * @param page Puppeteer Page instance
   * @param options Navigation options
   */
  waitForNavigation: (
    page: Page,
    options?: Pick<NavigationOptions, "waitUntil" | "timeout">,
  ) => NavigationService.waitForNavigation(page, options),

  /**
   * Wait for selector to be visible on page
   * @param page Puppeteer Page instance
   * @param selector CSS selector to wait for
   * @param timeout Maximum wait time in milliseconds
   */
  waitForSelector: (page: Page, selector: string, timeout?: number) =>
    NavigationService.waitForSelector(page, selector, timeout),

  /**
   * Register a plugin
   * @param plugin Plugin implementation
   * @param options Plugin options
   */
  registerPlugin: (plugin: PuppeteerPlugin, options?: Record<string, any>) =>
    PluginManager.registerPlugin(plugin, options),

  /**
   * Unregister a plugin
   * @param pluginName Plugin name
   */
  unregisterPlugin: (pluginName: string) =>
    PluginManager.unregisterPlugin(pluginName),

  /**
   * Get a plugin by name
   * @param pluginName Plugin name
   */
  getPlugin: (pluginName: string) =>
    PluginManager.getPlugin(pluginName),

  /**
   * Get all registered plugins
   */
  getAllPlugins: () => PluginManager.getAllPlugins(),

  /**
   * Default browser arguments
   */
  DEFAULT_BROWSER_ARGS,
};

// Export modules
export { PuppeteerExtends, Logger, SessionManager, Events, PuppeteerEvents, CaptchaService, CaptchaType };

// Export types for better developer experience
export { 
  BrowserOptions, 
  NavigationOptions, 
  PuppeteerPlugin, 
  PluginContext, 
  SessionOptions, 
  SessionData,
  CaptchaOptions,
  CaptchaSolution
};

// Default export for CommonJS compatibility
export default PuppeteerExtends;
