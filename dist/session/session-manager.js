"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
/**
 * @since 1.7.0
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
const events_1 = require("../events");
/**
 * SessionManager provides functionality to persist browser state
 * between sessions, including cookies and storage
 */
class SessionManager {
    /**
     * Create a new SessionManager
     * @param options Session configuration
     */
    constructor(options = {}) {
        this.options = {
            sessionDir: path_1.default.join(process.cwd(), "tmp/puppeteer-extends/sessions"),
            name: "default",
            persistCookies: true,
            persistLocalStorage: true,
            persistSessionStorage: false,
            persistUserAgent: true,
            ...options,
        };
        this.sessionPath = path_1.default.join(this.options.sessionDir, `${this.options.name}.json`);
        this.sessionData = {
            cookies: [],
            storage: {
                localStorage: {},
                sessionStorage: {},
            },
            lastAccessed: Date.now(),
        };
        // Ensure session directory exists
        this.ensureSessionDir();
        // Load existing session if available
        this.loadSession();
    }
    /**
     * Ensure session directory exists
     * @private
     */
    ensureSessionDir() {
        try {
            fs_1.default.mkdirSync(this.options.sessionDir, { recursive: true });
        }
        catch (error) {
            logger_1.Logger.error("Failed to create session directory", error instanceof Error ? error : String(error));
        }
    }
    /**
     * Load session data from disk
     * @private
     */
    loadSession() {
        try {
            if (fs_1.default.existsSync(this.sessionPath)) {
                const data = fs_1.default.readFileSync(this.sessionPath, "utf8");
                this.sessionData = JSON.parse(data);
                logger_1.Logger.debug(`Session loaded from ${this.sessionPath}`);
            }
        }
        catch (error) {
            logger_1.Logger.error(`Failed to load session from ${this.sessionPath}`, error instanceof Error ? error : String(error));
        }
    }
    /**
     * Save session data to disk
     * @private
     */
    saveSession() {
        try {
            this.sessionData.lastAccessed = Date.now();
            fs_1.default.writeFileSync(this.sessionPath, JSON.stringify(this.sessionData, null, 2), "utf8");
            logger_1.Logger.debug(`Session saved to ${this.sessionPath}`);
        }
        catch (error) {
            logger_1.Logger.error(`Failed to save session to ${this.sessionPath}`, error instanceof Error ? error : String(error));
        }
    }
    /**
     * Apply session data to a page
     * @param page Puppeteer Page instance
     */
    async applySession(page) {
        try {
            // Apply cookies if enabled
            if (this.options.persistCookies && this.sessionData.cookies.length > 0) {
                await page.setCookie(...this.sessionData.cookies);
                logger_1.Logger.debug(`Applied ${this.sessionData.cookies.length} cookies to page`);
            }
            // Apply localStorage if enabled
            if (this.options.persistLocalStorage &&
                this.sessionData.storage.localStorage &&
                Object.keys(this.sessionData.storage.localStorage).length > 0) {
                await page.evaluate((storageData) => {
                    for (const [key, value] of Object.entries(storageData)) {
                        try {
                            localStorage.setItem(key, value);
                        }
                        catch (e) {
                            console.error(`Failed to set localStorage item: ${key}`, e);
                        }
                    }
                }, this.sessionData.storage.localStorage);
                logger_1.Logger.debug(`Applied localStorage data to page`);
            }
            // Apply sessionStorage if enabled
            if (this.options.persistSessionStorage &&
                this.sessionData.storage.sessionStorage &&
                Object.keys(this.sessionData.storage.sessionStorage).length > 0) {
                await page.evaluate((storageData) => {
                    for (const [key, value] of Object.entries(storageData)) {
                        try {
                            sessionStorage.setItem(key, value);
                        }
                        catch (e) {
                            console.error(`Failed to set sessionStorage item: ${key}`, e);
                        }
                    }
                }, this.sessionData.storage.sessionStorage);
                logger_1.Logger.debug(`Applied sessionStorage data to page`);
            }
            // Apply userAgent if enabled
            if (this.options.persistUserAgent && this.sessionData.userAgent) {
                await page.setUserAgent(this.sessionData.userAgent);
                logger_1.Logger.debug(`Applied userAgent: ${this.sessionData.userAgent}`);
            }
            // Emit session applied event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.SESSION_APPLIED, {
                sessionName: this.options.name || "default",
                page,
                cookies: this.sessionData.cookies.length,
                storageItems: Object.keys(this.sessionData.storage.localStorage || {})
                    .length,
            });
        }
        catch (error) {
            logger_1.Logger.error("Failed to apply session to page", error instanceof Error ? error : String(error));
            throw new Error(`Failed to apply session: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Extract session data from a page
     * @param page Puppeteer Page instance
     */
    async extractSession(page) {
        try {
            // Extract cookies if enabled
            if (this.options.persistCookies) {
                const cookies = await page.cookies();
                // Filter cookies by domain if domains are specified
                if (this.options.domains && this.options.domains.length > 0) {
                    this.sessionData.cookies = cookies.filter((cookie) => this.options.domains.some((domain) => cookie.domain.includes(domain) ||
                        cookie.domain.includes(`.${domain}`)));
                }
                else {
                    this.sessionData.cookies = cookies;
                }
                logger_1.Logger.debug(`Extracted ${this.sessionData.cookies.length} cookies from page`);
            }
            // Extract localStorage if enabled
            if (this.options.persistLocalStorage) {
                this.sessionData.storage.localStorage = await page.evaluate(() => {
                    const data = {};
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key) {
                            data[key] = localStorage.getItem(key) || "";
                        }
                    }
                    return data;
                });
                logger_1.Logger.debug(`Extracted ${Object.keys(this.sessionData.storage.localStorage || {}).length} localStorage items`);
            }
            // Extract sessionStorage if enabled
            if (this.options.persistSessionStorage) {
                this.sessionData.storage.sessionStorage = await page.evaluate(() => {
                    const data = {};
                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        if (key) {
                            data[key] = sessionStorage.getItem(key) || "";
                        }
                    }
                    return data;
                });
                logger_1.Logger.debug(`Extracted ${Object.keys(this.sessionData.storage.sessionStorage || {}).length} sessionStorage items`);
            }
            // Extract userAgent if enabled
            if (this.options.persistUserAgent) {
                this.sessionData.userAgent = await page.evaluate(() => navigator.userAgent);
                logger_1.Logger.debug(`Extracted userAgent: ${this.sessionData.userAgent}`);
            }
            // Save the session data
            this.saveSession();
            // Emit session extracted event
            await events_1.Events.emitAsync(events_1.PuppeteerEvents.SESSION_EXTRACTED, {
                sessionName: this.options.name || "default",
                page,
                cookies: this.sessionData.cookies.length,
                storageItems: Object.keys(this.sessionData.storage.localStorage || {})
                    .length,
            });
        }
        catch (error) {
            logger_1.Logger.error("Failed to extract session from page", error instanceof Error ? error : String(error));
            throw new Error(`Failed to extract session: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get the current session data
     */
    getSessionData() {
        return { ...this.sessionData };
    }
    /**
     * Set session data directly
     * @param data Session data to set
     */
    setSessionData(data) {
        this.sessionData = {
            ...this.sessionData,
            ...data,
            lastAccessed: Date.now(),
        };
        this.saveSession();
    }
    /**
     * Clear the current session
     */
    clearSession() {
        this.sessionData = {
            cookies: [],
            storage: {
                localStorage: {},
                sessionStorage: {},
            },
            lastAccessed: Date.now(),
        };
        this.saveSession();
        logger_1.Logger.debug("Session cleared");
        // Emit session cleared event
        events_1.Events.emit(events_1.PuppeteerEvents.SESSION_CLEARED, {
            sessionName: this.options.name || "default",
        });
    }
    /**
     * Delete the session file
     */
    deleteSession() {
        try {
            if (fs_1.default.existsSync(this.sessionPath)) {
                fs_1.default.unlinkSync(this.sessionPath);
                logger_1.Logger.debug(`Session file deleted: ${this.sessionPath}`);
            }
            this.clearSession();
        }
        catch (error) {
            logger_1.Logger.error(`Failed to delete session file: ${this.sessionPath}`, error instanceof Error ? error : String(error));
        }
    }
    /**
     * Create a SessionManager instance from a page
     * @param page Puppeteer Page instance
     * @param options Session options
     */
    static async fromPage(page, options = {}) {
        const manager = new SessionManager(options);
        await manager.extractSession(page);
        return manager;
    }
    /**
     * Create a SessionManager instance from a browser
     * @param browser Puppeteer Browser instance
     * @param options Session options
     */
    static async fromBrowser(browser, options = {}) {
        const page = await browser.newPage();
        const manager = await SessionManager.fromPage(page, options);
        await page.close();
        return manager;
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=session-manager.js.map