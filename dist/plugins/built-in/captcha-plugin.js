"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptchaPlugin = void 0;
const logger_1 = require("../../utils/logger");
const captcha_helper_1 = require("../../captcha/captcha-helper");
const events_1 = require("../../events");
/**
 * CaptchaPlugin provides automatic captcha detection and solving
 */
class CaptchaPlugin {
    constructor(options) {
        this.name = "captcha-plugin";
        this.version = "1.0.0";
        this.initialize = async (options) => {
            if (options) {
                this.options = {
                    ...this.options,
                    ...options,
                };
            }
            try {
                const balance = await this.captchaHelper.getBalance();
                logger_1.Logger.debug(`🧩 Captcha plugin initialized with service: ${this.options.service}, balance: ${balance}`);
                // Register custom events
                events_1.Events.emit("captcha:initialized", {
                    service: this.options.service,
                    balance,
                });
            }
            catch (error) {
                logger_1.Logger.error("Error initializing captcha plugin", error instanceof Error ? error : String(error));
            }
        };
        this.onPageCreated = async (page, context) => {
            logger_1.Logger.debug(`🧩 Setting up captcha handling for new page`);
            // Set up automatic captcha handling
            if (this.options.autoDetect) {
                await this.captchaHelper.setupAutomaticCaptchaHandling(page);
            }
        };
        this.onAfterNavigation = async (page, url, success, context) => {
            if (!success || !this.options.autoDetect) {
                return;
            }
            // Skip for ignored URLs
            if (this.options.ignoreUrls &&
                this.options.ignoreUrls.some((pattern) => url.includes(pattern))) {
                logger_1.Logger.debug(`🧩 Skipping captcha detection for ignored URL: ${url}`);
                return;
            }
            // Check for captchas
            logger_1.Logger.debug(`🧩 Checking for captchas after navigation to ${url}`);
            const captchas = await this.captchaHelper.detectCaptchas(page);
            const totalCaptchas = (captchas.recaptchaV2?.length || 0) +
                (captchas.recaptchaV3?.length || 0) +
                (captchas.hcaptcha?.length || 0) +
                (captchas.funcaptcha?.length || 0) +
                (captchas.turnstile?.length || 0);
            if (totalCaptchas > 0) {
                logger_1.Logger.debug(`🧩 Found ${totalCaptchas} captchas on page`);
                // Solve captchas if auto-solve is enabled
                if (this.options.autoSolve) {
                    // Solve reCAPTCHA v2
                    for (const options of captchas.recaptchaV2 || []) {
                        try {
                            await this.captchaHelper.solveRecaptchaV2(page, options);
                        }
                        catch (error) {
                            logger_1.Logger.error(`Error solving reCAPTCHA v2`, error instanceof Error ? error : String(error));
                        }
                    }
                    // Solve hCaptcha
                    for (const options of captchas.hcaptcha || []) {
                        try {
                            await this.captchaHelper.solveHcaptcha(page, options);
                        }
                        catch (error) {
                            logger_1.Logger.error(`Error solving hCaptcha`, error instanceof Error ? error : String(error));
                        }
                    }
                }
            }
        };
        this.cleanup = async () => {
            logger_1.Logger.debug(`🧩 Captcha plugin cleanup complete`);
        };
        this.options = {
            autoDetect: true,
            autoSolve: true,
            ...options,
        };
        if (!options.apiKey) {
            throw new Error("Captcha API key is required");
        }
        if (!options.service) {
            throw new Error("Captcha service is required");
        }
        this.captchaHelper = new captcha_helper_1.CaptchaHelper({
            service: options.service,
            apiKey: options.apiKey,
            apiUrl: options.apiUrl,
            autoDetect: options.autoDetect,
            autoSolve: options.autoSolve,
            timeout: options.timeout,
        });
    }
    /**
     * Get the captcha helper instance
     */
    getCaptchaHelper() {
        return this.captchaHelper;
    }
    /**
     * Get the current balance
     */
    async getBalance() {
        return this.captchaHelper.getBalance();
    }
}
exports.CaptchaPlugin = CaptchaPlugin;
//# sourceMappingURL=captcha-plugin.js.map