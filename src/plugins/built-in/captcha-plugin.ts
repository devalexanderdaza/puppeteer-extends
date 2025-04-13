/**
 * @since 1.7.0
 */
import { Page } from "puppeteer";
import { PuppeteerPlugin, PluginContext } from "../plugin-interface";
import { Logger } from "../../utils/logger";
import { CaptchaHelper, CaptchaHelperConfig } from "../../captcha/captcha-helper";
import { Events, PuppeteerEvents } from "../../events";

export interface CaptchaPluginOptions extends CaptchaHelperConfig {
  /**
   * Should captchas be detected automatically on page load?
   * @default true
   */
  autoDetect?: boolean;
  
  /**
   * Should detected captchas be solved automatically?
   * @default true
   */
  autoSolve?: boolean;
  
  /**
   * Page URLs to ignore (don't detect/solve captchas)
   */
  ignoreUrls?: string[];
}

/**
 * CaptchaPlugin provides automatic captcha detection and solving
 */
export class CaptchaPlugin implements PuppeteerPlugin {
  name = "captcha-plugin";
  version = "1.0.0";
  
  private options: CaptchaPluginOptions;
  private captchaHelper: CaptchaHelper;
  
  constructor(options: CaptchaPluginOptions) {
    this.options = {
      autoDetect: true,
      autoSolve: true,
      ...options
    };
    
    if (!options.apiKey) {
      throw new Error("Captcha API key is required");
    }
    
    if (!options.service) {
      throw new Error("Captcha service is required");
    }
    
    this.captchaHelper = new CaptchaHelper({
      service: options.service,
      apiKey: options.apiKey,
      apiUrl: options.apiUrl,
      autoDetect: options.autoDetect,
      autoSolve: options.autoSolve,
      timeout: options.timeout
    });
  }
  
  initialize = async (options?: Record<string, any>): Promise<void> => {
    if (options) {
      this.options = { 
        ...this.options, 
        ...options as unknown as CaptchaPluginOptions 
      };
    }
    
    try {
      const balance = await this.captchaHelper.getBalance();
      Logger.debug(`🧩 Captcha plugin initialized with service: ${this.options.service}, balance: ${balance}`);
      
      // Register custom events
      Events.emit('captcha:initialized', {
        service: this.options.service,
        balance
      });
    } catch (error) {
      Logger.error('Error initializing captcha plugin', error instanceof Error ? error : String(error));
    }
  }
  
  onPageCreated = async (page: Page, context: PluginContext): Promise<void> => {
    Logger.debug(`🧩 Setting up captcha handling for new page`);
    
    // Set up automatic captcha handling
    if (this.options.autoDetect) {
      await this.captchaHelper.setupAutomaticCaptchaHandling(page);
    }
  }
  
  onAfterNavigation = async (page: Page, url: string, success: boolean, context: PluginContext): Promise<void> => {
    if (!success || !this.options.autoDetect) {
      return;
    }
    
    // Skip for ignored URLs
    if (this.options.ignoreUrls && this.options.ignoreUrls.some(pattern => url.includes(pattern))) {
      Logger.debug(`🧩 Skipping captcha detection for ignored URL: ${url}`);
      return;
    }
    
    // Check for captchas
    Logger.debug(`🧩 Checking for captchas after navigation to ${url}`);
    const captchas = await this.captchaHelper.detectCaptchas(page);
    
    const totalCaptchas = 
      (captchas.recaptchaV2?.length || 0) + 
      (captchas.recaptchaV3?.length || 0) + 
      (captchas.hcaptcha?.length || 0) + 
      (captchas.funcaptcha?.length || 0) + 
      (captchas.turnstile?.length || 0);
    
    if (totalCaptchas > 0) {
      Logger.debug(`🧩 Found ${totalCaptchas} captchas on page`);
      
      // Solve captchas if auto-solve is enabled
      if (this.options.autoSolve) {
        // Solve reCAPTCHA v2
        for (const options of captchas.recaptchaV2 || []) {
          try {
            await this.captchaHelper.solveRecaptchaV2(page, options);
          } catch (error) {
            Logger.error(`Error solving reCAPTCHA v2`, error instanceof Error ? error : String(error));
          }
        }
        
        // Solve hCaptcha
        for (const options of captchas.hcaptcha || []) {
          try {
            await this.captchaHelper.solveHcaptcha(page, options);
          } catch (error) {
            Logger.error(`Error solving hCaptcha`, error instanceof Error ? error : String(error));
          }
        }
      }
    }
  }
  
  cleanup = async (): Promise<void> => {
    Logger.debug(`🧩 Captcha plugin cleanup complete`);
  }
  
  /**
   * Get the captcha helper instance
   */
  public getCaptchaHelper(): CaptchaHelper {
    return this.captchaHelper;
  }
  
  /**
   * Get the current balance
   */
  public async getBalance(): Promise<number> {
    return this.captchaHelper.getBalance();
  }
}