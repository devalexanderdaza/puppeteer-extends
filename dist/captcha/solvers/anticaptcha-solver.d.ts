import { CaptchaSolver, CaptchaSolverConfig, CaptchaOptions, CaptchaSolution } from "../interfaces";
/**
 * Implementation for Anti-Captcha service
 * https://anti-captcha.com/
 */
export declare class AntiCaptchaSolver implements CaptchaSolver {
    name: string;
    private apiKey;
    private apiUrl;
    private defaultTimeout;
    private pollingInterval;
    constructor(config: CaptchaSolverConfig);
    /**
     * Get account balance
     */
    getBalance(): Promise<number>;
    /**
     * Solve a captcha
     */
    solveCaptcha(captchaOpts: CaptchaOptions): Promise<CaptchaSolution>;
    /**
     * Report incorrect solution for refund
     */
    reportIncorrect(id: string): Promise<boolean>;
    /**
     * Create a captcha solving task
     */
    private createTask;
    /**
     * Wait for the result of a captcha task
     */
    private waitForResult;
}
