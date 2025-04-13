/**
 * @since 1.7.0
 */
import { Page, Browser } from "puppeteer";
import { NavigationOptions } from "../navigation";
/**
 * Context provided to plugin hooks with relevant objects
 */
export interface PluginContext {
    browser?: Browser;
    page?: Page;
    options?: Record<string, any>;
}
/**
 * Base interface for puppeteer-extends plugins
 */
export interface PuppeteerPlugin {
    name: string;
    version?: string;
    onBeforeBrowserLaunch?: (options: any, context: PluginContext) => Promise<any>;
    onAfterBrowserLaunch?: (browser: Browser, context: PluginContext) => Promise<void>;
    onBeforeBrowserClose?: (browser: Browser, context: PluginContext) => Promise<void>;
    onPageCreated?: (page: Page, context: PluginContext) => Promise<void>;
    onBeforePageClose?: (page: Page, context: PluginContext) => Promise<void>;
    onBeforeNavigation?: (page: Page, url: string, options: NavigationOptions, context: PluginContext) => Promise<void>;
    onAfterNavigation?: (page: Page, url: string, success: boolean, context: PluginContext) => Promise<void>;
    onError?: (error: Error, context: PluginContext) => Promise<boolean>;
    initialize?: (options?: Record<string, any>) => Promise<void>;
    cleanup?: () => Promise<void>;
}
