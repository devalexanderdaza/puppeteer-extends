/**
 * @since 2.0.0
 */
import { Browser } from "puppeteer";
import { BrowserOptions } from "./browser-options";
/**
 * BrowserFactory manages multiple browser instances
 * Replaces the previous singleton pattern with a more flexible factory
 */
export declare class BrowserFactory {
    private static instances;
    private static initialized;
    /**
     * Initialize puppeteer-extra and plugins
     * @private
     */
    private static initialize;
    /**
     * Get browser instance by ID, creating it if necessary
     * @param options Browser configuration options
     */
    static getBrowser(options?: BrowserOptions): Promise<Browser>;
    /**
     * Create a new browser instance
     * @param options Browser configuration options
     * @private
     */
    private static createBrowser;
    /**
     * Close a specific browser instance
     * @param instanceId Browser instance ID
     */
    static closeBrowser(instanceId?: string): Promise<void>;
    /**
     * Close all browser instances
     */
    static closeAllBrowsers(): Promise<void>;
}
