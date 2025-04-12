/**
 * @since 1.6.0
 */
import puppeteer, { Browser } from "puppeteer";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";

import { BrowserOptions, DEFAULT_BROWSER_ARGS } from "./browser-options";
import { Logger } from "../utils/logger";

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

    try {
      const browser = await puppeteerExtra.launch({
        headless: isHeadless,
        ignoreHTTPSErrors: true,
        args: customArguments,
        userDataDir,
        defaultViewport: null,
        slowMo: 10,
      });

      if (isDebug) {
        Logger.debug(`🚧 Browser successfully started`);
      }

      // Handle disconnection and cleanup
      browser.on("disconnected", () => {
        if (isDebug) {
          Logger.debug(
            `🚧 Browser disconnected: ${options.instanceId || "default"}`,
          );
        }
        this.instances.delete(options.instanceId || "default");
      });

      return browser;
    } catch (error) {
      if (isDebug) {
        Logger.debug(
          `🚧 Error launching browser: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
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
      await browser.close();
      this.instances.delete(instanceId);
    }
  }

  /**
   * Close all browser instances
   */
  public static async closeAllBrowsers(): Promise<void> {
    for (const [id, browser] of this.instances.entries()) {
      await browser.close();
      this.instances.delete(id);
    }
  }
}
