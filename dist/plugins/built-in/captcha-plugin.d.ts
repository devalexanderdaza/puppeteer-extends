/**
 * @since 1.7.0
 */
import { Page } from "puppeteer";
import { PuppeteerPlugin, PluginContext } from "../plugin-interface";
import { CaptchaHelper, CaptchaHelperConfig } from "../../captcha/captcha-helper";
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
export declare class CaptchaPlugin implements PuppeteerPlugin {
    name: string;
    version: string;
    private options;
    private captchaHelper;
    constructor(options: CaptchaPluginOptions);
    initialize: (options?: Record<string, any>) => Promise<void>;
    onPageCreated: (page: Page, context: PluginContext) => Promise<void>;
    onAfterNavigation: (page: Page, url: string, success: boolean, context: PluginContext) => Promise<void>;
    cleanup: () => Promise<void>;
    /**
     * Get the captcha helper instance
     */
    getCaptchaHelper(): CaptchaHelper;
    /**
     * Get the current balance
     */
    getBalance(): Promise<number>;
}
