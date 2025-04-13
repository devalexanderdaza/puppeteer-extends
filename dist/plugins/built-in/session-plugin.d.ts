/**
 * @since 1.7.0
 */
import { Page, Browser } from "puppeteer";
import { PuppeteerPlugin, PluginContext } from "../plugin-interface";
import { SessionManager, SessionOptions } from "../../session/session-manager";
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
export declare class SessionPlugin implements PuppeteerPlugin {
    name: string;
    version: string;
    private options;
    private sessionManager;
    constructor(options?: SessionPluginOptions);
    initialize: (options?: Record<string, any>) => Promise<void>;
    onPageCreated: (page: Page, context: PluginContext) => Promise<void>;
    onBeforeNavigation: (page: Page, url: string, options: any, context: PluginContext) => Promise<void>;
    onAfterNavigation: (page: Page, url: string, success: boolean, context: PluginContext) => Promise<void>;
    onBeforePageClose: (page: Page, context: PluginContext) => Promise<void>;
    onBeforeBrowserClose: (browser: Browser, context: PluginContext) => Promise<void>;
    cleanup: () => Promise<void>;
    /**
     * Get the session manager instance
     */
    getSessionManager(): SessionManager;
    /**
     * Clear the current session data
     */
    clearSession(): void;
    /**
     * Delete the session file
     */
    deleteSession(): void;
}
