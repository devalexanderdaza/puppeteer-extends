/**
 * @since 2.0.0
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
}
