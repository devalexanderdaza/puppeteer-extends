/**
 * @since 1.6.0
 */
import puppeteer, { Browser } from "puppeteer";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";

import { BrowserOptions, DEFAULT_BROWSER_ARGS } from "./browser-options";
import { Logger } from "../utils/logger";
import { PluginManager, PluginContext } from "../plugins";
import { Events, PuppeteerEvents, BrowserEventParams, PageEventParams, ErrorEventParams } from "../events";

/**
 * BrowserFactory manages multiple browser instances
 * Replaces the previous singleton pattern with a more flexible factory
 */
export class BrowserFactory {
  private static instances: Map<string, Browser> = new Map();
  private static initialized = false;

  /**
   * Initialize puppeteer-extra and plugins
   * @private
   */
  private static initialize(): void {
    if (!this.initialized) {
      require("tls").DEFAULT_MIN_VERSION = "TLSv1";

      // Configure puppeteer-extra
      puppeteerExtra.use(stealthPlugin());

      // @ts-ignore - Fix for EventEmitter warning
      puppeteerExtra.setMaxListeners = () => {};

      this.initialized = true;
    }
  }

  /**
   * Get browser instance by ID, creating it if necessary
   * @param options Browser configuration options
   */
  public static async getBrowser(
    options: BrowserOptions = {},
  ): Promise<Browser> {
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
  private static async createBrowser(
    options: BrowserOptions,
  ): Promise<Browser> {
    const {
      isHeadless = true,
      isDebug = false,
      customArguments = DEFAULT_BROWSER_ARGS,
      userDataDir = path.join(process.cwd(), "tmp/puppeteer-extends"),
    } = options;

    if (isDebug) {
      Logger.debug(
        `🚧 Starting browser with instance ID: ${options.instanceId || "default"}`,
      );
      Logger.debug(`🚧 User data directory: ${userDataDir}`);
    }

    // Create plugin context
    const context: PluginContext = {
      options,
    };

    try {
      // Create launch options
      let launchOptions = {
        headless: isHeadless,
        // ignoreHTTPSErrors: true,

        args: [
          "--no-sandbox",
          "--disable-web-security",
          ...customArguments,
        ],
        // userDataDir,
        ignoreDefaultArgs: [],
        // slowMo: 10, 
      };

      // Execute plugin hook before browser launch
      await PluginManager.executeHook('onBeforeBrowserLaunch', context, launchOptions);

      // Launch browser
      const browser = await puppeteerExtra.launch(launchOptions);

      if (isDebug) {
        Logger.debug(`🚧 Browser successfully started`);
      }

      // Emit browser created event
      await Events.emitAsync(PuppeteerEvents.BROWSER_CREATED, {
        browser,
        instanceId: options.instanceId || "default",
        options
      } as BrowserEventParams);

      // Update context with browser
      context.browser = browser;

      // Run plugin hook after browser launch
      await PluginManager.executeHook('onAfterBrowserLaunch', context, browser);

      // Extend newPage to support plugin hooks
      const originalNewPage = browser.newPage.bind(browser);
      
      // Override newPage method to run plugin hooks
      browser.newPage = async () => {
        const page = await originalNewPage();
        
        // Create page context for plugins
        const pageContext: PluginContext = {
          browser,
          page,
          options,
        };

        // Emit page created event
        await Events.emitAsync(PuppeteerEvents.PAGE_CREATED, {
          page,
          browser,
          instanceId: options.instanceId || "default",
        } as PageEventParams);
        
        // Execute plugin hook for page creation
        await PluginManager.executeHook('onPageCreated', pageContext, page);
        
        // Override close method to run plugin hooks
        const originalClose = page.close.bind(page);
        page.close = async (options?: any) => {
          // Emit page closing event
          await Events.emitAsync(PuppeteerEvents.PAGE_CLOSED, {
            page,
            browser,
            instanceId: options.instanceId || "default",
          } as PageEventParams);

          // Execute plugin hook before page close
          await PluginManager.executeHook('onBeforePageClose', pageContext, page);
          
          // Close the page
          return originalClose(options);
        };

        // Set up error handling for page errors
        page.on('error', async (error) => {
          // Emit page error event
          await Events.emitAsync(PuppeteerEvents.PAGE_ERROR, {
            error,
            source: 'page',
            context: {
              page,
              browser,
              instanceId: options.instanceId || "default",
            }
          } as ErrorEventParams);
          
          // Execute error hook
          await PluginManager.executeErrorHook(error, { 
            page, 
            browser,
            options
          });
        });
        
        return page;
      };

      // Handle disconnection and cleanup
      browser.on("disconnected", async () => {
        if (isDebug) {
          Logger.debug(
            `🚧 Browser disconnected: ${options.instanceId || "default"}`,
          );
        }
        
        // Emit browser closed event
        await Events.emitAsync(PuppeteerEvents.BROWSER_CLOSED, {
          browser,
          instanceId: options.instanceId || "default",
          options
        } as BrowserEventParams);

        // Execute plugin hook before browser disconnect
        await PluginManager.executeHook('onBeforeBrowserClose', context, browser);
        
        this.instances.delete(options.instanceId || "default");
      });

      return browser;
    } catch (error) {
      if (isDebug) {
        Logger.debug(
          `🚧 Error launching browser: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      
      // Emit browser error event
      await Events.emitAsync(PuppeteerEvents.BROWSER_ERROR, {
        error: error instanceof Error ? error : new Error(String(error)),
        source: 'browser',
        context: { options }
      } as ErrorEventParams);

      // Execute error hook
      await PluginManager.executeErrorHook(
        error instanceof Error ? error : new Error(String(error)), 
        context
      );
      
      throw new Error(
        `Failed to launch browser: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Close a specific browser instance
   * @param instanceId Browser instance ID
   */
  public static async closeBrowser(
    instanceId: string = "default",
  ): Promise<void> {
    const browser = this.instances.get(instanceId);
    if (browser) {
      // Create context for plugin hooks
      const context: PluginContext = {
        browser,
        options: { instanceId },
      };

      // Emit browser closing event
      await Events.emitAsync(PuppeteerEvents.BROWSER_CLOSED, {
        browser,
        instanceId,
        options: { instanceId }
      } as BrowserEventParams);
      
      // Execute plugin hook before browser close
      await PluginManager.executeHook('onBeforeBrowserClose', context, browser);
      
      await browser.close();
      this.instances.delete(instanceId);
    }
  }

  /**
   * Close all browser instances
   */
  public static async closeAllBrowsers(): Promise<void> {
    for (const [id, browser] of this.instances.entries()) {
      // Create context for plugin hooks
      const context: PluginContext = {
        browser,
        options: { instanceId: id },
      };

      // Emit browser closing event
      await Events.emitAsync(PuppeteerEvents.BROWSER_CLOSED, {
        browser,
        instanceId: id,
        options: { instanceId: id }
      } as BrowserEventParams);
      
      // Execute plugin hook before browser close
      await PluginManager.executeHook('onBeforeBrowserClose', context, browser);
      
      await browser.close();
      this.instances.delete(id);
    }
  }
}
