/**
 * @since 1.7.0
 */
import { Page } from "puppeteer";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { PuppeteerPlugin, PluginContext } from "../plugin-interface";
import { Logger } from "../../utils/logger";

export interface StealthPluginOptions {
  /**
   * Enable WebDriver property hiding
   * @default true
   */
  hideWebDriver?: boolean;
  
  /**
   * Enable Chrome runtime hiding
   * @default true
   */
  hideChromeRuntime?: boolean;
}

/**
 * StealthPlugin improves browser fingerprinting protection
 * by applying additional anti-detection techniques
 */
export class StealthPlugin implements PuppeteerPlugin {
  name = "stealth-plugin";
  version = "1.0.0";
  private options: StealthPluginOptions = {
    hideWebDriver: true,
    hideChromeRuntime: true,
  };
  
  constructor(options: StealthPluginOptions = {}) {
    this.options = { ...this.options, ...options };
  }
  
  async initialize(options?: StealthPluginOptions): Promise<void> {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    Logger.debug(`🥷 Stealth plugin initialized`);
  }
  
  async onPageCreated(page: Page, context: PluginContext): Promise<void> {
    Logger.debug(`🥷 Applying stealth mode to new page`);
    
    // Apply additional page-level stealth techniques
    if (this.options.hideWebDriver) {
      await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        delete Navigator.prototype.webdriver;
      });
    }
    
    if (this.options.hideChromeRuntime) {
      await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        window.chrome = undefined;
      });
    }
  }
  
  async cleanup(): Promise<void> {
    Logger.debug(`🥷 Stealth plugin cleanup complete`);
  }
}