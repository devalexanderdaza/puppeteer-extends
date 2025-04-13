/**
 * @since 1.7.0
 */
import { Page } from "puppeteer";
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
export declare class NavigationService {
    /**
     * Navigate to a URL with CloudFlare protection bypass and retry mechanism
     * @param page Puppeteer Page instance
     * @param targetUrl URL to navigate to
     * @param options Navigation options
     */
    static goto(page: Page, targetUrl: string, options?: NavigationOptions): Promise<boolean>;
    /**
     * Close a page
     * @param page Puppeteer Page instance
     */
    static closePage(page: Page): Promise<void>;
    /**
     * Wait for navigation to complete
     * @param page Puppeteer Page instance
     * @param options Navigation options
     */
    static waitForNavigation(page: Page, options?: Pick<NavigationOptions, "waitUntil" | "timeout">): Promise<boolean>;
    /**
     * Wait for selector to be visible on page
     * @param page Puppeteer Page instance
     * @param selector CSS selector to wait for
     * @param timeout Maximum wait time in milliseconds
     */
    static waitForSelector(page: Page, selector: string, timeout?: number): Promise<boolean>;
    /**
     * Get the current URL of the page
     * @param page Puppeteer Page instance
     */
    static getCurrentUrl(page: Page): string;
    /**
     * Get the current page title
     * @param page Puppeteer Page instance
     */
    static getPageTitle(page: Page): Promise<string>;
    /**
     * Click on a selector
     * @param page Puppeteer Page instance
     * @param selector CSS selector to click
     * @param options Click options
     */
    static click(page: Page, selector: string, options?: {
        delay?: number;
    }): Promise<void>;
    /**
     * Type text into an input field
     * @param page Puppeteer Page instance
     * @param selector CSS selector of the input field
     * @param text Text to type
     * @param options Type options
     */
    static type(page: Page, selector: string, text: string, options?: {
        delay?: number;
    }): Promise<void>;
    /**
     * Evaluate a function in the context of the page
     * @param page Puppeteer Page instance
     * @param fn Function to evaluate
     * @param args Arguments to pass to the function
     */
    static evaluate<T>(page: Page, fn: (...args: any[]) => T, ...args: any[]): Promise<T>;
    /**
     * Get the page content
     * @param page Puppeteer Page instance
     */
    static getContent(page: Page): Promise<string>;
}
