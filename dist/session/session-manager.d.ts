import { Browser, Page } from "puppeteer";
export interface Cookie {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
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
export declare class SessionManager {
    private options;
    private sessionPath;
    private sessionData;
    /**
     * Create a new SessionManager
     * @param options Session configuration
     */
    constructor(options?: SessionOptions);
    /**
     * Ensure session directory exists
     * @private
     */
    private ensureSessionDir;
    /**
     * Load session data from disk
     * @private
     */
    private loadSession;
    /**
     * Save session data to disk
     * @private
     */
    private saveSession;
    /**
     * Apply session data to a page
     * @param page Puppeteer Page instance
     */
    applySession(page: Page): Promise<void>;
    /**
     * Extract session data from a page
     * @param page Puppeteer Page instance
     */
    extractSession(page: Page): Promise<void>;
    /**
     * Get the current session data
     */
    getSessionData(): SessionData;
    /**
     * Set session data directly
     * @param data Session data to set
     */
    setSessionData(data: Partial<SessionData>): void;
    /**
     * Clear the current session
     */
    clearSession(): void;
    /**
     * Delete the session file
     */
    deleteSession(): void;
    /**
     * Create a SessionManager instance from a page
     * @param page Puppeteer Page instance
     * @param options Session options
     */
    static fromPage(page: Page, options?: SessionOptions): Promise<SessionManager>;
    /**
     * Create a SessionManager instance from a browser
     * @param browser Puppeteer Browser instance
     * @param options Session options
     */
    static fromBrowser(browser: Browser, options?: SessionOptions): Promise<SessionManager>;
}
