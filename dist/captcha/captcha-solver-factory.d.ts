/**
 * @since 1.7.0
 */
import { CaptchaSolver, CaptchaSolverConfig } from "./interfaces";
/**
 * Supported captcha solver services
 */
export declare enum CaptchaService {
    TWOCAPTCHA = "2captcha",
    ANTICAPTCHA = "anticaptcha"
}
/**
 * Factory for creating captcha solver instances
 */
export declare class CaptchaSolverFactory {
    private static instances;
    /**
     * Get or create a captcha solver instance
     * @param service Captcha service to use
     * @param config Configuration for the solver
     */
    static getSolver(service: CaptchaService, config: CaptchaSolverConfig): CaptchaSolver;
    /**
     * Clear all solver instances
     */
    static clearSolvers(): void;
}
