/**
 * @since 1.7.0
 */
import { Page } from "puppeteer";
import { CaptchaSolution, RecaptchaV2Options, RecaptchaV3Options, HCaptchaOptions, FunCaptchaOptions, TurnstileOptions } from "./interfaces";
import { CaptchaService } from "./captcha-solver-factory";
/**
 * Configuration for the CaptchaHelper
 */
export interface CaptchaHelperConfig {
    /**
     * Service to use
     */
    service: CaptchaService;
    /**
     * API key for the captcha service
     */
    apiKey: string;
    /**
     * Auto-detect captchas on page load
     */
    autoDetect?: boolean;
    /**
     * Auto-solve detected captchas
     */
    autoSolve?: boolean;
    /**
     * Maximum wait time for captcha solution (seconds)
     */
    timeout?: number;
    /**
     * API URL (optional)
     */
    apiUrl?: string;
}
/**
 * CaptchaHelper provides methods to detect and solve captchas
 */
export declare class CaptchaHelper {
    private config;
    constructor(config: CaptchaHelperConfig);
    /**
     * Get the balance of the captcha service account
     */
    getBalance(): Promise<number>;
    /**
     * Detect all captchas on the current page
     * @param page Puppeteer Page instance
     */
    detectCaptchas(page: Page): Promise<{
        recaptchaV2?: RecaptchaV2Options[];
        recaptchaV3?: RecaptchaV3Options[];
        hcaptcha?: HCaptchaOptions[];
        funcaptcha?: FunCaptchaOptions[];
        turnstile?: TurnstileOptions[];
    }>;
    /**
     * Solve reCAPTCHA v2
     * @param page Puppeteer Page instance
     * @param options Options for solving
     */
    solveRecaptchaV2(page: Page, options: RecaptchaV2Options): Promise<CaptchaSolution>;
    /**
     * Solve reCAPTCHA v3
     * @param page Puppeteer Page instance
     * @param options Options for solving
     */
    solveRecaptchaV3(page: Page, options: RecaptchaV3Options): Promise<CaptchaSolution>;
    /**
     * Solve hCaptcha
     * @param page Puppeteer Page instance
     * @param options Options for solving
     */
    solveHcaptcha(page: Page, options: HCaptchaOptions): Promise<CaptchaSolution>;
    /**
     * Solve image captcha from URL or base64
     * @param imageSource URL or base64 image data
     * @param options Additional options
     */
    solveImageCaptcha(imageSource: string, options?: {
        caseSensitive?: boolean;
        length?: number;
    }): Promise<CaptchaSolution>;
    /**
     * Automate captcha handling for a page
     * @param page Puppeteer Page instance
     */
    setupAutomaticCaptchaHandling(page: Page): Promise<void>;
    /**
     * Report an incorrect solution to get a refund
     * @param id Solution ID to report
     */
    reportIncorrect(id: string): Promise<boolean>;
}
