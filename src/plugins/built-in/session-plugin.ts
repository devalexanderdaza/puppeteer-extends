/**
 * @since 1.7.0
 */
import { Page, Browser } from "puppeteer";
import { PuppeteerPlugin, PluginContext } from "../plugin-interface";
import { SessionManager, SessionOptions } from "../../session/session-manager";
import { Logger } from "../../utils/logger";

export interface SessionPluginOptions extends SessionOptions {
  /**
   * Whether to extract session data after navigation
   * @default true
   */
  extractAfterNavigation?: boolean;
  
  /**
   * Whether to apply session data before navigation
   * @default true
   */
  applyBeforeNavigation?: boolean;
}

/**
 * SessionPlugin provides session persistence functionality
 */
export class SessionPlugin implements PuppeteerPlugin {
  name = "session-plugin";
  version = "1.0.0";
  
  private options: SessionPluginOptions;
  private sessionManager: SessionManager;
  
  constructor(options: SessionPluginOptions = {}) {
    this.options = {
      name: "default",
      extractAfterNavigation: true,
      applyBeforeNavigation: true,
      ...options
    };
    
    this.sessionManager = new SessionManager(this.options);
  }
  
  initialize = async (options?: Record<string, any>): Promise<void> => {
    if (options) {
      this.options = { 
        ...this.options, 
        ...options as unknown as SessionPluginOptions 
      };
      // Recreate session manager with new options
      this.sessionManager = new SessionManager(this.options);
    }
    
    Logger.debug(`🔑 Session plugin initialized with session: ${this.options.name}`);
  }
  
  onPageCreated = async (page: Page, context: PluginContext): Promise<void> => {
    // Apply session data to the page if we have any
    const sessionData = this.sessionManager.getSessionData();
    
    if (sessionData.cookies.length > 0 || 
        Object.keys(sessionData.storage.localStorage || {}).length > 0) {
      Logger.debug(`🔑 Applying session data to new page`);
      await this.sessionManager.applySession(page);
    }
  }
  
  onBeforeNavigation = async (page: Page, url: string, options: any, context: PluginContext): Promise<void> => {
    if (this.options.applyBeforeNavigation) {
      // Apply session data before navigation
      const sessionData = this.sessionManager.getSessionData();
      
      if (sessionData.cookies.length > 0 || 
          Object.keys(sessionData.storage.localStorage || {}).length > 0) {
        Logger.debug(`🔑 Applying session data before navigation to: ${url}`);
        await this.sessionManager.applySession(page);
      }
    }
  }
  
  onAfterNavigation = async (page: Page, url: string, success: boolean, context: PluginContext): Promise<void> => {
    if (success && this.options.extractAfterNavigation) {
      // Extract session data after successful navigation
      Logger.debug(`🔑 Extracting session data after navigation to: ${url}`);
      await this.sessionManager.extractSession(page);
    }
  }
  
  onBeforePageClose = async (page: Page, context: PluginContext): Promise<void> => {
    // Save the session state when page is closed
    Logger.debug(`🔑 Saving session data before page close`);
    await this.sessionManager.extractSession(page);
  }
  
  onBeforeBrowserClose = async (browser: Browser, context: PluginContext): Promise<void> => {
    // Nothing special to do here since we're saving on page close
    Logger.debug(`🔑 Browser closing, session data already saved`);
  }
  
  cleanup = async (): Promise<void> => {
    Logger.debug(`🔑 Session plugin cleanup complete`);
  }
  
  /**
   * Get the session manager instance
   */
  public getSessionManager(): SessionManager {
    return this.sessionManager;
  }
  
  /**
   * Clear the current session data
   */
  public clearSession(): void {
    this.sessionManager.clearSession();
  }
  
  /**
   * Delete the session file
   */
  public deleteSession(): void {
    this.sessionManager.deleteSession();
  }
}