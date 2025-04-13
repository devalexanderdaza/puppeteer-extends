/**
 * @since 1.7.0
 */
import { Page } from "puppeteer";
import { PuppeteerPlugin, PluginContext } from "../plugin-interface";
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
export declare class StealthPlugin implements PuppeteerPlugin {
    name: string;
    version: string;
    private options;
    constructor(options?: StealthPluginOptions);
    initialize: (options?: Record<string, any>) => Promise<void>;
    onPageCreated: (page: Page, context: PluginContext) => Promise<void>;
    cleanup: () => Promise<void>;
}
