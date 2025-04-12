/**
 * @since 2.0.0
 */
import { Page } from "puppeteer";
import { Logger } from "../utils/logger";

/**
 * Navigation options
 */
export interface NavigationOptions {
  /**
   * Wait until specified events to consider navigation successful
   * @default ["load", "networkidle0"]
   */
  waitUntil?: ("load" | "domcontentloaded" | "networkidle0" | "networkidle2")[];
  
  /**
   * Enable debug logging
   * @default false
   */
  isDebug?: boolean;
  
  /**
   * Navigation timeout in milliseconds (0 to disable)
   * @default 30000
   */
  timeout?: number;
  
  /**
   * Custom headers to set for the request
   */
  headers?: Record<string, string>;
  
  /**
   * Max number of retry attempts
   * @default 1
   */
  maxRetries?: number;
  
  /**
   * Delay between retries in milliseconds
   * @default 5000
   */
  retryDelay?: number;
}

/**
 * Navigation utilities for Puppeteer pages
 */
export class NavigationService {
  /**
   * Navigate to a URL with CloudFlare protection bypass and retry mechanism
   * @param page Puppeteer Page instance
   * @param targetUrl URL to navigate to
   * @param options Navigation options
   */
  public static async goto(
    page: Page,
    targetUrl: string,
    options: NavigationOptions = {}
  ): Promise<boolean> {
    const {
      waitUntil = ["load", "networkidle0"],
      isDebug = false,
      timeout = 30000,
      headers = {},
      maxRetries = 1,
      retryDelay = 5000
    } = options;

    let attempts = 0;
    
    while (attempts <= maxRetries) {
      try {
        if (isDebug) {
          Logger.debug(`🚧 Navigating to ${targetUrl} (attempt ${attempts + 1}/${maxRetries + 1})`);
        }

        // Reset request interception before setting it again
        await page.setRequestInterception(false);
        await page.setRequestInterception(true);

        // Handle requests and apply custom headers
        page.once("request", (request) => {
          const overrides: any = {
            headers: {
              ...request.headers(),
              ...headers
            }
          };
          
          try {
            request.continue(overrides);
          } catch (e) {
            // Request may have been handled already
            if (isDebug) {
              Logger.debug(`🚧 Request continuation error: ${e instanceof Error ? e.message : String(e)}`);
            }
          }
        });

        // Navigate to page
        await page.goto(targetUrl, {
          waitUntil: waitUntil as any,
          timeout,
        });

        // Reset request interception after navigation
        await page.setRequestInterception(false);
        
        if (isDebug) {
          Logger.debug(`🚧 Successfully navigated to ${targetUrl}`);
        }
        
        return true;
      } catch (error) {
        attempts++;
        
        if (isDebug) {
          Logger.debug(`🚧 Navigation error: ${error instanceof Error ? error.message : String(error)}`);
          
          if (attempts <= maxRetries) {
            Logger.debug(`🚧 Retrying in ${retryDelay}ms...`);
          }
        }
        
        // Reset request interception if it failed
        try {
          await page.setRequestInterception(false);
        } catch (e) {
          // Ignore errors during cleanup
        }
        
        if (attempts <= maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          if (isDebug) {
            Logger.debug(`🚧 All navigation attempts failed for ${targetUrl}`);
          }
          return false;
        }
      }
    }
    
    return false;
  }

  /**
   * Close a page
   * @param page Puppeteer Page instance
   */
  public static async closePage(page: Page): Promise<void> {
    try {
      await page.close();
    } catch (error) {
      // Ignore errors during page closing
    }
  }
  
  /**
   * Wait for navigation to complete
   * @param page Puppeteer Page instance
   * @param options Navigation options
   */
  public static async waitForNavigation(
    page: Page, 
    options: Pick<NavigationOptions, 'waitUntil' | 'timeout'> = {}
  ): Promise<boolean> {
    const {
      waitUntil = ["load", "networkidle0"],
      timeout = 30000
    } = options;
    
    try {
      await page.waitForNavigation({
        waitUntil: waitUntil as any,
        timeout
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Wait for selector to be visible on page
   * @param page Puppeteer Page instance
   * @param selector CSS selector to wait for
   * @param timeout Maximum wait time in milliseconds
   */
  public static async waitForSelector(
    page: Page,
    selector: string,
    timeout: number = 30000
  ): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { visible: true, timeout });
      return true;
    } catch (error) {
      return false;
    }
  }
}