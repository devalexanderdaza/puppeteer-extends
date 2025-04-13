/**
 * @since 1.7.0
 */
import { Page } from "puppeteer";
import { Logger } from "../utils";
import { PluginManager, PluginContext } from "../plugins";
import { Events, PuppeteerEvents, NavigationEventParams, ErrorEventParams } from "../events";

/**
 * Navigation options
 */
export interface NavigationOptions {
  /**
   * Wait until specified events to consider navigation successful
   * @default ["load", "networkidle0"]
   */
  waitUntil?: Array<"load" | "domcontentloaded" | "networkidle0" | "networkidle2">;

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
    options: NavigationOptions = {},
  ): Promise<boolean> {
    const {
      waitUntil = [],
      isDebug = false,
      timeout = 0,
      // headers = {},
      maxRetries = 1,
      retryDelay = 5000,
    } = options;

    // Create plugin context
    const context: PluginContext = {
      page,
      options,
    };

    let attempts = 0;

    while (attempts <= maxRetries) {
      try {
        if (isDebug) {
          Logger.debug(
            `🚧 Navigating to ${targetUrl} (attempt ${attempts + 1}/${maxRetries + 1})`,
          );
        }

        // Emit navigation started event
        await Events.emitAsync(PuppeteerEvents.NAVIGATION_STARTED, {
          page,
          url: targetUrl,
          options
        } as NavigationEventParams);

        // Execute plugin hook before navigation
        await PluginManager.executeHook('onBeforeNavigation', context, page, targetUrl, options);

        // Reset request interception before setting it again
        await page.setRequestInterception(false);
        await page.setRequestInterception(true);

        // Handle requests and apply custom headers
        page.once("request", (request) => {
          const overrides: any = {
            headers: {
              ...request.headers(),
              // ...headers,
            },
          };

          try {
            request.continue(overrides);
          } catch (e) {
            // Request may have been handled already
            if (isDebug) {
              Logger.debug(
                `🚧 Request continuation error: ${e instanceof Error ? e : String(e)}`,
              );
            }
            // TODO - Validate if this is the right way to handle this
            // request.continue();
          }
        });

        // Navigate to page
        await page.goto(targetUrl, {
          waitUntil: waitUntil,
          timeout,
        });

        // Reset request interception after navigation
        await page.setRequestInterception(false);

        if (isDebug) {
          Logger.debug(`🚧 Successfully navigated to ${targetUrl}`);
        }

        // Emit navigation succeeded event
        await Events.emitAsync(PuppeteerEvents.NAVIGATION_SUCCEEDED, {
          page,
          url: targetUrl,
          options
        } as NavigationEventParams);

        // Execute plugin hook after successful navigation
        await PluginManager.executeHook('onAfterNavigation', context, page, targetUrl, true);

        return true;
      } catch (error) {
        attempts++;

        if (isDebug) {
          Logger.debug(
            `🚧 Navigation error: ${error instanceof Error ? error : String(error)}`,
          );

          if (attempts <= maxRetries) {
            Logger.debug(`🚧 Retrying in ${retryDelay}ms...`);
          }
        }

        // Emit navigation error event
        await Events.emitAsync(PuppeteerEvents.NAVIGATION_ERROR, {
          error: error instanceof Error ? error : new Error(String(error)),
          source: 'navigation',
          context: { page, url: targetUrl, options }
        } as ErrorEventParams);

        // Reset request interception if it failed
        try {
          await page.setRequestInterception(false);
        } catch (e) {
          // Ignore errors during cleanup
        }

        // Execute error hook and check if any plugin handled it
        const handled = await PluginManager.executeErrorHook(
          error instanceof Error ? error : new Error(String(error)),
          { ...context }
        );

        // If error wasn't handled by any plugin, continue with retries
        if (!handled && attempts <= maxRetries) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else if (!handled) {
          if (isDebug) {
            Logger.debug(`🚧 All navigation attempts failed for ${targetUrl}`);
          }

          // Emit navigation failed event
          await Events.emitAsync(PuppeteerEvents.NAVIGATION_FAILED, {
            page,
            url: targetUrl,
            options,
            error: error instanceof Error ? error : new Error(String(error))
          } as NavigationEventParams);
          
          // Execute plugin hook after failed navigation
          await PluginManager.executeHook('onAfterNavigation', context, page, targetUrl, false);
          
          return false;
        } else {
          // If a plugin handled the error, try again immediately if we have attempts left
          if (attempts <= maxRetries) {
            continue;
          } else {
            await PluginManager.executeHook('onAfterNavigation', context, page, targetUrl, false);
            return false;
          }
        }
      }
    }

    // Execute plugin hook after all navigation attempts failed
    await PluginManager.executeHook('onAfterNavigation', context, page, targetUrl, false);
    
    // Emit navigation failed event
    await Events.emitAsync(PuppeteerEvents.NAVIGATION_FAILED, {
      page,
      url: targetUrl,
      options
    } as NavigationEventParams);

    return false;
  }

  /**
   * Close a page
   * @param page Puppeteer Page instance
   */
  public static async closePage(page: Page): Promise<void> {
    // Create plugin context
    const context: PluginContext = {
      page,
    };

    try {
      // Execute plugin hook before page close
      await PluginManager.executeHook('onBeforePageClose', context, page);
      
      await page.close();
    } catch (error) {
      // Execute error hook
      await PluginManager.executeErrorHook(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      
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
    options: Pick<NavigationOptions, "waitUntil" | "timeout"> = {},
  ): Promise<boolean> {
    const { waitUntil = ["load", "networkidle0"], timeout = 30000 } = options;

    try {
      await page.waitForNavigation({
        waitUntil: waitUntil as any,
        timeout,
      });
      return true;
    } catch (error) {
      // Execute error hook
      await PluginManager.executeErrorHook(
        error instanceof Error ? error : new Error(String(error)),
        { page, options }
      );
      
      // Emit navigation error event
      await Events.emitAsync(PuppeteerEvents.NAVIGATION_ERROR, {
        error: error instanceof Error ? error : new Error(String(error)),
        source: 'waitForNavigation',
        context: { page, options }
      } as ErrorEventParams);
      
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
    timeout: number = 30000,
  ): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { visible: true, timeout });
      return true;
    } catch (error) {
      // Execute error hook
      await PluginManager.executeErrorHook(
        error instanceof Error ? error : new Error(String(error)),
        { page, options: { selector, timeout } }
      );
      
      // Emit error event
      await Events.emitAsync(PuppeteerEvents.ERROR, {
        error: error instanceof Error ? error : new Error(String(error)),
        source: 'waitForSelector',
        context: { page, selector, timeout }
      } as ErrorEventParams);
      
      return false;
    }
  }

  /**
   * Get the current URL of the page
   * @param page Puppeteer Page instance
   */
  public static getCurrentUrl(page: Page): string {
    return page.url();
  }
  /**
   * Get the current page title
   * @param page Puppeteer Page instance
   */
  public static async getPageTitle(page: Page): Promise<string> {
    return page.title();
  }
  
  /**
   * Click on a selector
   * @param page Puppeteer Page instance
   * @param selector CSS selector to click
   * @param options Click options
   */
  public static async click(
    page: Page,
    selector: string,
    options: { delay?: number } = {},
  ): Promise<void> {
    const { delay = 0 } = options;

    try {
      await page.waitForSelector(selector, { visible: true });
      await page.click(selector, { delay });
    } catch (error) {
      // Execute error hook
      await PluginManager.executeErrorHook(
        error instanceof Error ? error : new Error(String(error)),
        { page, options: { selector, ...options } }
      );

      // Emit error event
      await Events.emitAsync(PuppeteerEvents.ERROR, {
        error: error instanceof Error ? error : new Error(String(error)),
        source: 'click',
        context: { page, selector, options }
      } as ErrorEventParams);
      
      throw error;
    }
  }
  /**
   * Type text into an input field
   * @param page Puppeteer Page instance
   * @param selector CSS selector of the input field
   * @param text Text to type
   * @param options Type options
   */
  public static async type(
    page: Page,
    selector: string,
    text: string,
    options: { delay?: number } = {},
  ): Promise<void> {
    const { delay = 0 } = options;

    try {
      await page.waitForSelector(selector, { visible: true });
      await page.type(selector, text, { delay });
    } catch (error) {
      // Execute error hook
      await PluginManager.executeErrorHook(
        error instanceof Error ? error : new Error(String(error)),
        { page, options: { selector, text, ...options } }
      );

      // Emit error event
      await Events.emitAsync(PuppeteerEvents.ERROR, {
        error: error instanceof Error ? error : new Error(String(error)),
        source: 'type',
        context: { page, selector, text, options }
      } as ErrorEventParams);
      
      throw error;
    }
  }
  /**
   * Evaluate a function in the context of the page
   * @param page Puppeteer Page instance
   * @param fn Function to evaluate
   * @param args Arguments to pass to the function
   */
  public static async evaluate<T>(
    page: Page,
    fn: (...args: any[]) => T,
    ...args: any[]
  ): Promise<T> { 
    try {
      return await page.evaluate(fn, ...args);
    } catch (error) {
      // Execute error hook
      await PluginManager.executeErrorHook(
        error instanceof Error ? error : new Error(String(error)),
        { page, options: { fn, args } }
      );

      // Emit error event
      await Events.emitAsync(PuppeteerEvents.ERROR, {
        error: error instanceof Error ? error : new Error(String(error)),
        source: 'evaluate',
        context: { page, fn, args }
      } as ErrorEventParams);
      
      throw error;
    }
  }
  /**
   * Get the page content
   * @param page Puppeteer Page instance
   */
  public static async getContent(page: Page): Promise<string> {
    try {
      return await page.content();
    } catch (error) {
      // Execute error hook
      await PluginManager.executeErrorHook(
        error instanceof Error ? error : new Error(String(error)),
        { page, options: {} }
      );

      // Emit error event
      await Events.emitAsync(PuppeteerEvents.ERROR, {
        error: error instanceof Error ? error : new Error(String(error)),
        source: 'getContent',
        context: { page, options: {} }
      } as ErrorEventParams);
      
      throw error;
    }
  }
}
