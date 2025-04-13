/**
 * @since 1.7.0
 */
import fs from 'fs';
import path from 'path';
import { Browser, Page } from 'puppeteer';
import { Logger } from "../utils/logger";
import { Events, PuppeteerEvents, SessionEventParams } from "../events";

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface StorageData {
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
}

export interface SessionData {
  cookies: Cookie[];
  storage: StorageData;
  userAgent?: string;
  lastAccessed: number;
}

export interface SessionOptions {
  /**
   * Directory to store session data
   * @default "./tmp/puppeteer-extends/sessions"
   */
  sessionDir?: string;
  
  /**
   * Session name
   * @default "default"
   */
  name?: string;
  
  /**
   * Whether to maintain cookies between browser sessions
   * @default true
   */
  persistCookies?: boolean;
  
  /**
   * Whether to maintain localStorage between browser sessions
   * @default true
   */
  persistLocalStorage?: boolean;
  
  /**
   * Whether to maintain sessionStorage between browser sessions
   * @default false
   */
  persistSessionStorage?: boolean;
  
  /**
   * Whether to maintain userAgent between browser sessions
   * @default true
   */
  persistUserAgent?: boolean;
  
  /**
   * Domains to include when saving cookies
   * If not specified, all domains will be included
   */
  domains?: string[];
}

/**
 * SessionManager provides functionality to persist browser state
 * between sessions, including cookies and storage
 */
export class SessionManager {
  private options: SessionOptions;
  private sessionPath: string;
  private sessionData: SessionData;
  
  /**
   * Create a new SessionManager
   * @param options Session configuration
   */
  constructor(options: SessionOptions = {}) {
    this.options = {
      sessionDir: path.join(process.cwd(), 'tmp/puppeteer-extends/sessions'),
      name: 'default',
      persistCookies: true,
      persistLocalStorage: true,
      persistSessionStorage: false,
      persistUserAgent: true,
      ...options
    };
    
    this.sessionPath = path.join(
      this.options.sessionDir!,
      `${this.options.name}.json`
    );
    
    this.sessionData = {
      cookies: [],
      storage: {
        localStorage: {},
        sessionStorage: {}
      },
      lastAccessed: Date.now()
    };
    
    // Ensure session directory exists
    this.ensureSessionDir();
    
    // Load existing session if available
    this.loadSession();
  }
  
  /**
   * Ensure session directory exists
   * @private
   */
  private ensureSessionDir(): void {
    try {
      fs.mkdirSync(this.options.sessionDir!, { recursive: true });
    } catch (error) {
      Logger.error('Failed to create session directory', error instanceof Error ? error : String(error));
    }
  }
  
  /**
   * Load session data from disk
   * @private
   */
  private loadSession(): void {
    try {
      if (fs.existsSync(this.sessionPath)) {
        const data = fs.readFileSync(this.sessionPath, 'utf8');
        this.sessionData = JSON.parse(data);
        Logger.debug(`Session loaded from ${this.sessionPath}`);
      }
    } catch (error) {
      Logger.error(`Failed to load session from ${this.sessionPath}`, error instanceof Error ? error : String(error));
    }
  }
  
  /**
   * Save session data to disk
   * @private
   */
  private saveSession(): void {
    try {
      this.sessionData.lastAccessed = Date.now();
      fs.writeFileSync(
        this.sessionPath,
        JSON.stringify(this.sessionData, null, 2),
        'utf8'
      );
      Logger.debug(`Session saved to ${this.sessionPath}`);
    } catch (error) {
      Logger.error(`Failed to save session to ${this.sessionPath}`, error instanceof Error ? error : String(error));
    }
  }
  
  /**
   * Apply session data to a page
   * @param page Puppeteer Page instance
   */
  public async applySession(page: Page): Promise<void> {
    try {
      // Apply cookies if enabled
      if (this.options.persistCookies && this.sessionData.cookies.length > 0) {
        await page.setCookie(...this.sessionData.cookies);
        Logger.debug(`Applied ${this.sessionData.cookies.length} cookies to page`);
      }
      
      // Apply localStorage if enabled
      if (
        this.options.persistLocalStorage &&
        this.sessionData.storage.localStorage &&
        Object.keys(this.sessionData.storage.localStorage).length > 0
      ) {
        await page.evaluate((storageData) => {
          for (const [key, value] of Object.entries(storageData)) {
            try {
              localStorage.setItem(key, value);
            } catch (e) {
              console.error(`Failed to set localStorage item: ${key}`, e);
            }
          }
        }, this.sessionData.storage.localStorage);
        
        Logger.debug(`Applied localStorage data to page`);
      }
      
      // Apply sessionStorage if enabled
      if (
        this.options.persistSessionStorage &&
        this.sessionData.storage.sessionStorage &&
        Object.keys(this.sessionData.storage.sessionStorage).length > 0
      ) {
        await page.evaluate((storageData) => {
          for (const [key, value] of Object.entries(storageData)) {
            try {
              sessionStorage.setItem(key, value);
            } catch (e) {
              console.error(`Failed to set sessionStorage item: ${key}`, e);
            }
          }
        }, this.sessionData.storage.sessionStorage);
        
        Logger.debug(`Applied sessionStorage data to page`);
      }
      
      // Apply userAgent if enabled
      if (this.options.persistUserAgent && this.sessionData.userAgent) {
        await page.setUserAgent(this.sessionData.userAgent);
        Logger.debug(`Applied userAgent: ${this.sessionData.userAgent}`);
      }

      // Emit session applied event
      await Events.emitAsync(PuppeteerEvents.SESSION_APPLIED, {
        sessionName: this.options.name || 'default',
        page,
        cookies: this.sessionData.cookies.length,
        storageItems: Object.keys(this.sessionData.storage.localStorage || {}).length
      } as SessionEventParams);
    } catch (error) {
      Logger.error('Failed to apply session to page', error instanceof Error ? error : String(error));
      throw new Error(`Failed to apply session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Extract session data from a page
   * @param page Puppeteer Page instance
   */
  public async extractSession(page: Page): Promise<void> {
    try {
      // Extract cookies if enabled
      if (this.options.persistCookies) {
        const cookies = await page.cookies();
        
        // Filter cookies by domain if domains are specified
        if (this.options.domains && this.options.domains.length > 0) {
          this.sessionData.cookies = cookies.filter(cookie => 
            this.options.domains!.some(domain => 
              cookie.domain.includes(domain) || 
              cookie.domain.includes(`.${domain}`)
            )
          );
        } else {
          this.sessionData.cookies = cookies;
        }
        
        Logger.debug(`Extracted ${this.sessionData.cookies.length} cookies from page`);
      }
      
      // Extract localStorage if enabled
      if (this.options.persistLocalStorage) {
        this.sessionData.storage.localStorage = await page.evaluate(() => {
          const data: Record<string, string> = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              data[key] = localStorage.getItem(key) || '';
            }
          }
          return data;
        });
        
        Logger.debug(`Extracted ${Object.keys(this.sessionData.storage.localStorage || {}).length} localStorage items`);
      }
      
      // Extract sessionStorage if enabled
      if (this.options.persistSessionStorage) {
        this.sessionData.storage.sessionStorage = await page.evaluate(() => {
          const data: Record<string, string> = {};
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
              data[key] = sessionStorage.getItem(key) || '';
            }
          }
          return data;
        });
        
        Logger.debug(`Extracted ${Object.keys(this.sessionData.storage.sessionStorage || {}).length} sessionStorage items`);
      }
      
      // Extract userAgent if enabled
      if (this.options.persistUserAgent) {
        this.sessionData.userAgent = await page.evaluate(() => navigator.userAgent);
        Logger.debug(`Extracted userAgent: ${this.sessionData.userAgent}`);
      }
      
      // Save the session data
      this.saveSession();
      
      // Emit session extracted event
      await Events.emitAsync(PuppeteerEvents.SESSION_EXTRACTED, {
        sessionName: this.options.name || 'default',
        page,
        cookies: this.sessionData.cookies.length,
        storageItems: Object.keys(this.sessionData.storage.localStorage || {}).length
      } as SessionEventParams);
    } catch (error) {
      Logger.error('Failed to extract session from page', error instanceof Error ? error : String(error));
      throw new Error(`Failed to extract session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get the current session data
   */
  public getSessionData(): SessionData {
    return { ...this.sessionData };
  }
  
  /**
   * Set session data directly
   * @param data Session data to set
   */
  public setSessionData(data: Partial<SessionData>): void {
    this.sessionData = {
      ...this.sessionData,
      ...data,
      lastAccessed: Date.now()
    };
    
    this.saveSession();
  }
  
  /**
   * Clear the current session
   */
  public clearSession(): void {
    this.sessionData = {
      cookies: [],
      storage: {
        localStorage: {},
        sessionStorage: {}
      },
      lastAccessed: Date.now()
    };
    
    this.saveSession();
    Logger.debug('Session cleared');
    
    // Emit session cleared event
    Events.emit(PuppeteerEvents.SESSION_CLEARED, {
      sessionName: this.options.name || 'default'
    } as SessionEventParams);
  }
  
  /**
   * Delete the session file
   */
  public deleteSession(): void {
    try {
      if (fs.existsSync(this.sessionPath)) {
        fs.unlinkSync(this.sessionPath);
        Logger.debug(`Session file deleted: ${this.sessionPath}`);
      }
      
      this.clearSession();
    } catch (error) {
      Logger.error(`Failed to delete session file: ${this.sessionPath}`, error instanceof Error ? error : String(error));
    }
  }
  
  /**
   * Create a SessionManager instance from a page
   * @param page Puppeteer Page instance
   * @param options Session options
   */
  public static async fromPage(page: Page, options: SessionOptions = {}): Promise<SessionManager> {
    const manager = new SessionManager(options);
    await manager.extractSession(page);
    return manager;
  }
  
  /**
   * Create a SessionManager instance from a browser
   * @param browser Puppeteer Browser instance
   * @param options Session options
   */
  public static async fromBrowser(browser: Browser, options: SessionOptions = {}): Promise<SessionManager> {
    const page = await browser.newPage();
    const manager = await SessionManager.fromPage(page, options);
    await page.close();
    return manager;
  }
}