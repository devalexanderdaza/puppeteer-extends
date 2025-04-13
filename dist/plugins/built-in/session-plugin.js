"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionPlugin = void 0;
const session_manager_1 = require("../../session/session-manager");
const logger_1 = require("../../utils/logger");
/**
 * SessionPlugin provides session persistence functionality
 */
class SessionPlugin {
    constructor(options = {}) {
        this.name = "session-plugin";
        this.version = "1.0.0";
        this.initialize = async (options) => {
            if (options) {
                this.options = {
                    ...this.options,
                    ...options,
                };
                // Recreate session manager with new options
                this.sessionManager = new session_manager_1.SessionManager(this.options);
            }
            logger_1.Logger.debug(`🔑 Session plugin initialized with session: ${this.options.name}`);
        };
        this.onPageCreated = async (page, context) => {
            // Apply session data to the page if we have any
            const sessionData = this.sessionManager.getSessionData();
            if (sessionData.cookies.length > 0 ||
                Object.keys(sessionData.storage.localStorage || {}).length > 0) {
                logger_1.Logger.debug(`🔑 Applying session data to new page`);
                await this.sessionManager.applySession(page);
            }
        };
        this.onBeforeNavigation = async (page, url, options, context) => {
            if (this.options.applyBeforeNavigation) {
                // Apply session data before navigation
                const sessionData = this.sessionManager.getSessionData();
                if (sessionData.cookies.length > 0 ||
                    Object.keys(sessionData.storage.localStorage || {}).length > 0) {
                    logger_1.Logger.debug(`🔑 Applying session data before navigation to: ${url}`);
                    await this.sessionManager.applySession(page);
                }
            }
        };
        this.onAfterNavigation = async (page, url, success, context) => {
            if (success && this.options.extractAfterNavigation) {
                // Extract session data after successful navigation
                logger_1.Logger.debug(`🔑 Extracting session data after navigation to: ${url}`);
                await this.sessionManager.extractSession(page);
            }
        };
        this.onBeforePageClose = async (page, context) => {
            // Save the session state when page is closed
            logger_1.Logger.debug(`🔑 Saving session data before page close`);
            await this.sessionManager.extractSession(page);
        };
        this.onBeforeBrowserClose = async (browser, context) => {
            // Nothing special to do here since we're saving on page close
            logger_1.Logger.debug(`🔑 Browser closing, session data already saved`);
        };
        this.cleanup = async () => {
            logger_1.Logger.debug(`🔑 Session plugin cleanup complete`);
        };
        this.options = {
            name: "default",
            extractAfterNavigation: true,
            applyBeforeNavigation: true,
            ...options,
        };
        this.sessionManager = new session_manager_1.SessionManager(this.options);
    }
    /**
     * Get the session manager instance
     */
    getSessionManager() {
        return this.sessionManager;
    }
    /**
     * Clear the current session data
     */
    clearSession() {
        this.sessionManager.clearSession();
    }
    /**
     * Delete the session file
     */
    deleteSession() {
        this.sessionManager.deleteSession();
    }
}
exports.SessionPlugin = SessionPlugin;
//# sourceMappingURL=session-plugin.js.map