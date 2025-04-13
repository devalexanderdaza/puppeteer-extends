"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptchaSolverFactory = exports.CaptchaService = void 0;
const _2captcha_solver_1 = require("./solvers/2captcha-solver");
const anticaptcha_solver_1 = require("./solvers/anticaptcha-solver");
const logger_1 = require("../utils/logger");
/**
 * Supported captcha solver services
 */
var CaptchaService;
(function (CaptchaService) {
    CaptchaService["TWOCAPTCHA"] = "2captcha";
    CaptchaService["ANTICAPTCHA"] = "anticaptcha";
})(CaptchaService || (exports.CaptchaService = CaptchaService = {}));
/**
 * Factory for creating captcha solver instances
 */
class CaptchaSolverFactory {
    /**
     * Get or create a captcha solver instance
     * @param service Captcha service to use
     * @param config Configuration for the solver
     */
    static getSolver(service, config) {
        const key = `${service}-${config.apiKey}`;
        if (!this.instances.has(key)) {
            let solver;
            switch (service) {
                case CaptchaService.TWOCAPTCHA:
                    solver = new _2captcha_solver_1.TwoCaptchaSolver(config);
                    break;
                case CaptchaService.ANTICAPTCHA:
                    solver = new anticaptcha_solver_1.AntiCaptchaSolver(config);
                    break;
                default:
                    throw new Error(`Unsupported captcha service: ${service}`);
            }
            this.instances.set(key, solver);
            logger_1.Logger.debug(`Created captcha solver instance for service: ${service}`);
        }
        return this.instances.get(key);
    }
    /**
     * Clear all solver instances
     */
    static clearSolvers() {
        this.instances.clear();
    }
}
exports.CaptchaSolverFactory = CaptchaSolverFactory;
CaptchaSolverFactory.instances = new Map();
//# sourceMappingURL=captcha-solver-factory.js.map