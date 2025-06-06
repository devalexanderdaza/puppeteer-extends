"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoCaptchaSolver = void 0;
/**
 * @since 1.7.0
 */
const axios_1 = __importDefault(require("axios"));
const interfaces_1 = require("../interfaces");
const logger_1 = require("../../utils/logger");
const common_1 = require("../../utils/common");
/**
 * Implementation for 2Captcha service
 * https://2captcha.com/
 */
class TwoCaptchaSolver {
    constructor(config) {
        this.name = "2captcha";
        this.apiKey = config.apiKey;
        this.apiUrl = config.apiUrl || "https://2captcha.com/";
        this.defaultTimeout = config.defaultTimeout || 120;
        this.pollingInterval = config.pollingInterval || 5000;
        if (!this.apiKey) {
            throw new Error("2Captcha API key is required");
        }
    }
    /**
     * Get account balance
     */
    async getBalance() {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}res.php`, {
                params: {
                    key: this.apiKey,
                    action: "getbalance",
                    json: 1,
                },
            });
            if (response.data.status === 1) {
                return parseFloat(response.data.request);
            }
            throw new Error(`Failed to get balance: ${response.data.request}`);
        }
        catch (error) {
            logger_1.Logger.error("Error getting 2Captcha balance", error instanceof Error ? error : String(error));
            throw error;
        }
    }
    /**
     * Solve a captcha
     */
    async solveCaptcha(captchaOpts) {
        const { type, options } = captchaOpts;
        try {
            const taskId = await this.createTask(type, options);
            logger_1.Logger.debug(`2Captcha task created, ID: ${taskId}`);
            const result = await this.waitForResult(taskId);
            return {
                token: result,
                id: taskId,
                expiration: new Date(Date.now() + 120000), // 2 minutes
            };
        }
        catch (error) {
            logger_1.Logger.error(`Error solving captcha with 2Captcha`, error instanceof Error ? error : String(error));
            throw error;
        }
    }
    /**
     * Report incorrect solution for refund
     */
    async reportIncorrect(id) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}res.php`, {
                params: {
                    key: this.apiKey,
                    action: "reportbad",
                    id,
                    json: 1,
                },
            });
            return response.data.status === 1;
        }
        catch (error) {
            logger_1.Logger.error("Error reporting incorrect 2Captcha solution", error instanceof Error ? error : String(error));
            return false;
        }
    }
    /**
     * Create a captcha solving task
     */
    async createTask(type, options) {
        const params = {
            key: this.apiKey,
            json: 1,
        };
        switch (type) {
            case interfaces_1.CaptchaType.RECAPTCHA_V2:
                params.method = "userrecaptcha";
                params.googlekey = options.sitekey;
                params.pageurl = options.url;
                if (options.invisible) {
                    params.invisible = 1;
                }
                if (options.enterprise) {
                    params.enterprise = 1;
                }
                if (options.s) {
                    params.data_s = options.s;
                }
                break;
            case interfaces_1.CaptchaType.RECAPTCHA_V3:
                params.method = "userrecaptcha";
                params.googlekey = options.sitekey;
                params.pageurl = options.url;
                params.version = "v3";
                params.action = options.action;
                if (options.score) {
                    params.min_score = options.score;
                }
                if (options.enterprise) {
                    params.enterprise = 1;
                }
                break;
            case interfaces_1.CaptchaType.HCAPTCHA:
                params.method = "hcaptcha";
                params.sitekey = options.sitekey;
                params.pageurl = options.url;
                if (options.enterprise) {
                    params.enterprise = 1;
                }
                break;
            case interfaces_1.CaptchaType.IMAGE_CAPTCHA:
                if (options.image.startsWith("http")) {
                    params.method = "post";
                    params.file = options.image;
                }
                else {
                    params.method = "base64";
                    params.body = options.image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
                }
                if (options.caseSensitive) {
                    params.case = 1;
                }
                if (options.length) {
                    params.length = options.length;
                }
                break;
            case interfaces_1.CaptchaType.FUNCAPTCHA:
                params.method = "funcaptcha";
                params.publickey = options.publicKey;
                params.pageurl = options.url;
                if (options.data) {
                    Object.entries(options.data).forEach(([key, value]) => {
                        params[`data[${key}]`] = value;
                    });
                }
                break;
            case interfaces_1.CaptchaType.TURNSTILE:
                params.method = "turnstile";
                params.sitekey = options.sitekey;
                params.pageurl = options.url;
                if (options.action) {
                    params.action = options.action;
                }
                break;
            default:
                throw new Error(`Unsupported captcha type: ${type}`);
        }
        const response = await axios_1.default.post(`${this.apiUrl}in.php`, null, {
            params,
        });
        if (response.data.status === 1) {
            return response.data.request;
        }
        throw new Error(`Failed to create task: ${response.data.request}`);
    }
    /**
     * Wait for the result of a captcha task
     */
    async waitForResult(taskId) {
        const startTime = Date.now();
        const timeoutMs = this.defaultTimeout * 1000;
        while (Date.now() - startTime < timeoutMs) {
            await (0, common_1.sleep)(this.pollingInterval / 1000);
            const response = await axios_1.default.get(`${this.apiUrl}res.php`, {
                params: {
                    key: this.apiKey,
                    action: "get",
                    id: taskId,
                    json: 1,
                },
            });
            if (response.data.status === 1) {
                return response.data.request;
            }
            if (response.data.request !== "CAPCHA_NOT_READY") {
                throw new Error(`Failed to get result: ${response.data.request}`);
            }
        }
        throw new Error(`Timeout waiting for captcha solution (${this.defaultTimeout}s)`);
    }
}
exports.TwoCaptchaSolver = TwoCaptchaSolver;
//# sourceMappingURL=2captcha-solver.js.map