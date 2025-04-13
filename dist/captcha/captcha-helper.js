"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptchaHelper = void 0;
const interfaces_1 = require("./interfaces");
const captcha_solver_factory_1 = require("./captcha-solver-factory");
const logger_1 = require("../utils/logger");
const events_1 = require("../events");
/**
 * CaptchaHelper provides methods to detect and solve captchas
 */
class CaptchaHelper {
    constructor(config) {
        this.config = {
            ...config,
            autoDetect: config.autoDetect ?? false,
            autoSolve: config.autoSolve ?? false,
            timeout: config.timeout ?? 120,
        };
    }
    /**
     * Get the balance of the captcha service account
     */
    async getBalance() {
        const solver = captcha_solver_factory_1.CaptchaSolverFactory.getSolver(this.config.service, {
            apiKey: this.config.apiKey,
            apiUrl: this.config.apiUrl,
            defaultTimeout: this.config.timeout,
        });
        return solver.getBalance();
    }
    /**
     * Detect all captchas on the current page
     * @param page Puppeteer Page instance
     */
    async detectCaptchas(page) {
        const url = page.url();
        const result = {
            recaptchaV2: [],
            recaptchaV3: [],
            hcaptcha: [],
            funcaptcha: [],
            turnstile: [],
        };
        // Detect reCAPTCHA v2
        const recaptchaV2 = await page.evaluate(() => {
            const sitekeys = [];
            const elements = document.querySelectorAll("[data-sitekey]");
            elements.forEach((element) => {
                const sitekey = element.getAttribute("data-sitekey");
                if (sitekey) {
                    const invisible = element.dataset.size === "invisible";
                    const s = element.dataset.s || undefined;
                    sitekeys.push({
                        url: window.location.href,
                        sitekey,
                        invisible,
                        s,
                    });
                }
            });
            // Check for grecaptcha object in window
            if (typeof window.grecaptcha !== "undefined") {
                const enterprise = typeof window.grecaptcha.enterprise !== "undefined";
                // Update all entries to include enterprise status
                sitekeys.forEach((item) => {
                    item.enterprise = enterprise;
                });
            }
            return sitekeys;
        });
        result.recaptchaV2 = recaptchaV2;
        // Detect hCaptcha
        const hcaptcha = await page.evaluate(() => {
            const sitekeys = [];
            const elements = document.querySelectorAll("[data-sitekey]");
            elements.forEach((element) => {
                if (element.className.includes("h-captcha") ||
                    element.getAttribute("data-hcaptcha-widget-id")) {
                    const sitekey = element.getAttribute("data-sitekey");
                    if (sitekey) {
                        sitekeys.push({
                            url: window.location.href,
                            sitekey,
                        });
                    }
                }
            });
            return sitekeys;
        });
        result.hcaptcha = hcaptcha;
        // Detect FunCaptcha
        const funcaptcha = await page.evaluate(() => {
            const sitekeys = [];
            // Check for arkose global object
            if (typeof window.arkose !== "undefined") {
                const arkose = window.arkose;
                if (arkose && arkose.getPublicKey) {
                    const publicKey = arkose.getPublicKey();
                    if (publicKey) {
                        sitekeys.push({
                            url: window.location.href,
                            publicKey,
                        });
                    }
                }
            }
            // Check for arkoselabs elements
            const elements = document.querySelectorAll('[id^="arkose-"]');
            elements.forEach((element) => {
                const id = element.id;
                const match = id.match(/arkose-(\d+)/);
                if (match && match[1]) {
                    sitekeys.push({
                        url: window.location.href,
                        publicKey: match[1],
                    });
                }
            });
            return sitekeys;
        });
        result.funcaptcha = funcaptcha;
        // Detect Turnstile
        const turnstile = await page.evaluate(() => {
            const sitekeys = [];
            const elements = document.querySelectorAll("[data-sitekey]");
            elements.forEach((element) => {
                if (element.className.includes("cf-turnstile") ||
                    element.getAttribute("data-action")) {
                    const sitekey = element.getAttribute("data-sitekey");
                    if (sitekey) {
                        sitekeys.push({
                            url: window.location.href,
                            sitekey,
                            action: element.getAttribute("data-action") || undefined,
                        });
                    }
                }
            });
            return sitekeys;
        });
        result.turnstile = turnstile;
        // Emit captcha detected event
        const totalCaptchas = result.recaptchaV2.length +
            result.recaptchaV3.length +
            result.hcaptcha.length +
            result.funcaptcha.length +
            result.turnstile.length;
        if (totalCaptchas > 0) {
            logger_1.Logger.debug(`Detected ${totalCaptchas} captchas on ${url}`);
            await events_1.Events.emitAsync("captcha:detected", {
                url,
                captchas: result,
                count: totalCaptchas,
            });
        }
        return result;
    }
    /**
     * Solve reCAPTCHA v2
     * @param page Puppeteer Page instance
     * @param options Options for solving
     */
    async solveRecaptchaV2(page, options) {
        const solver = captcha_solver_factory_1.CaptchaSolverFactory.getSolver(this.config.service, {
            apiKey: this.config.apiKey,
            apiUrl: this.config.apiUrl,
            defaultTimeout: this.config.timeout,
        });
        logger_1.Logger.debug(`Solving reCAPTCHA v2 on ${options.url}`);
        const solution = await solver.solveCaptcha({
            type: interfaces_1.CaptchaType.RECAPTCHA_V2,
            options,
        });
        // Emit event
        await events_1.Events.emitAsync("captcha:solved", {
            url: options.url,
            type: interfaces_1.CaptchaType.RECAPTCHA_V2,
            solution: solution.token,
        });
        // Enter the solution on the page
        await page.evaluate((token) => {
            // Try to find textarea first
            const textarea = document.querySelector("textarea#g-recaptcha-response");
            if (textarea) {
                textarea.value = token;
                return true;
            }
            // Try to find hidden input
            const input = document.querySelector("input#g-recaptcha-response");
            if (input) {
                input.value = token;
                return true;
            }
            // Create a hidden input if none found
            const input2 = document.createElement("textarea");
            input2.id = "g-recaptcha-response";
            input2.name = "g-recaptcha-response";
            input2.value = token;
            input2.style.display = "none";
            document.body.appendChild(input2);
            return true;
        }, solution.token);
        logger_1.Logger.debug(`reCAPTCHA v2 solution applied: ${solution.token.substring(0, 15)}...`);
        return solution;
    }
    /**
     * Solve reCAPTCHA v3
     * @param page Puppeteer Page instance
     * @param options Options for solving
     */
    async solveRecaptchaV3(page, options) {
        const solver = captcha_solver_factory_1.CaptchaSolverFactory.getSolver(this.config.service, {
            apiKey: this.config.apiKey,
            apiUrl: this.config.apiUrl,
            defaultTimeout: this.config.timeout,
        });
        logger_1.Logger.debug(`Solving reCAPTCHA v3 on ${options.url} with action ${options.action}`);
        const solution = await solver.solveCaptcha({
            type: interfaces_1.CaptchaType.RECAPTCHA_V3,
            options,
        });
        // Emit event
        await events_1.Events.emitAsync("captcha:solved", {
            url: options.url,
            type: interfaces_1.CaptchaType.RECAPTCHA_V3,
            solution: solution.token,
        });
        // For v3, we usually don't need to enter the token, but return it for the callback
        logger_1.Logger.debug(`reCAPTCHA v3 solution received: ${solution.token.substring(0, 15)}...`);
        return solution;
    }
    /**
     * Solve hCaptcha
     * @param page Puppeteer Page instance
     * @param options Options for solving
     */
    async solveHcaptcha(page, options) {
        const solver = captcha_solver_factory_1.CaptchaSolverFactory.getSolver(this.config.service, {
            apiKey: this.config.apiKey,
            apiUrl: this.config.apiUrl,
            defaultTimeout: this.config.timeout,
        });
        logger_1.Logger.debug(`Solving hCaptcha on ${options.url}`);
        const solution = await solver.solveCaptcha({
            type: interfaces_1.CaptchaType.HCAPTCHA,
            options,
        });
        // Emit event
        await events_1.Events.emitAsync("captcha:solved", {
            url: options.url,
            type: interfaces_1.CaptchaType.HCAPTCHA,
            solution: solution.token,
        });
        // Enter the solution on the page
        await page.evaluate((token) => {
            // Try to find textarea first
            const textarea = document.querySelector('textarea[name="h-captcha-response"]');
            if (textarea) {
                textarea.value = token;
                return true;
            }
            // Try to find hidden input
            const input = document.querySelector('input[name="h-captcha-response"]');
            if (input) {
                input.value = token;
                return true;
            }
            // Create a hidden input if none found
            const input2 = document.createElement("textarea");
            input2.name = "h-captcha-response";
            input2.value = token;
            input2.style.display = "none";
            document.body.appendChild(input2);
            // Try to trigger the callback if hcaptcha object exists
            if (typeof window.hcaptcha !== "undefined") {
                const widgetIds = window.hcaptcha.getWidgetIDs();
                if (widgetIds && widgetIds.length > 0) {
                    try {
                        window.hcaptcha.execute(widgetIds[0], { token });
                    }
                    catch (e) {
                        console.error("Failed to execute hcaptcha callback", e);
                    }
                }
            }
            return true;
        }, solution.token);
        logger_1.Logger.debug(`hCaptcha solution applied: ${solution.token.substring(0, 15)}...`);
        return solution;
    }
    /**
     * Solve image captcha from URL or base64
     * @param imageSource URL or base64 image data
     * @param options Additional options
     */
    async solveImageCaptcha(imageSource, options = {}) {
        const solver = captcha_solver_factory_1.CaptchaSolverFactory.getSolver(this.config.service, {
            apiKey: this.config.apiKey,
            apiUrl: this.config.apiUrl,
            defaultTimeout: this.config.timeout,
        });
        logger_1.Logger.debug(`Solving image captcha`);
        const solution = await solver.solveCaptcha({
            type: interfaces_1.CaptchaType.IMAGE_CAPTCHA,
            options: {
                image: imageSource,
                caseSensitive: options.caseSensitive,
                length: options.length,
            },
        });
        // Emit event
        await events_1.Events.emitAsync("captcha:solved", {
            type: interfaces_1.CaptchaType.IMAGE_CAPTCHA,
            solution: solution.token,
        });
        logger_1.Logger.debug(`Image captcha solution: ${solution.token}`);
        return solution;
    }
    /**
     * Automate captcha handling for a page
     * @param page Puppeteer Page instance
     */
    async setupAutomaticCaptchaHandling(page) {
        // Skip if auto detection is disabled
        if (!this.config.autoDetect) {
            return;
        }
        // Listen for navigation complete events
        const detectAndSolve = async () => {
            try {
                const captchas = await this.detectCaptchas(page);
                // Nothing to do if no captchas found
                const totalCaptchas = (captchas.recaptchaV2?.length ?? 0) +
                    (captchas.hcaptcha?.length ?? 0);
                if (totalCaptchas === 0 || !this.config.autoSolve) {
                    return;
                }
                // Solve reCAPTCHA v2 (we don't auto-solve v3 as it's usually handled by callbacks)
                for (const options of captchas.recaptchaV2 ?? []) {
                    await this.solveRecaptchaV2(page, options);
                }
                // Solve hCaptcha
                for (const options of captchas.hcaptcha ?? []) {
                    await this.solveHcaptcha(page, options);
                }
                // We don't auto-solve FunCaptcha or Turnstile as they're more complex
                // and usually need special handling
            }
            catch (error) {
                logger_1.Logger.error("Error in automatic captcha handling", error instanceof Error ? error : String(error));
            }
        };
        // Detect on page load
        page.on("load", detectAndSolve);
        // Do initial detection if page is already loaded
        if (page.url() !== "about:blank") {
            await detectAndSolve();
        }
    }
    /**
     * Report an incorrect solution to get a refund
     * @param id Solution ID to report
     */
    async reportIncorrect(id) {
        const solver = captcha_solver_factory_1.CaptchaSolverFactory.getSolver(this.config.service, {
            apiKey: this.config.apiKey,
            apiUrl: this.config.apiUrl,
        });
        return solver.reportIncorrect(id);
    }
}
exports.CaptchaHelper = CaptchaHelper;
//# sourceMappingURL=captcha-helper.js.map