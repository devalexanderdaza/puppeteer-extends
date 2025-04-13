"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StealthPlugin = void 0;
const logger_1 = require("../../utils/logger");
/**
 * StealthPlugin improves browser fingerprinting protection
 * by applying additional anti-detection techniques
 */
class StealthPlugin {
    constructor(options = {}) {
        this.name = "stealth-plugin";
        this.version = "1.0.0";
        this.options = {
            hideWebDriver: true,
            hideChromeRuntime: true,
        };
        this.initialize = async (options) => {
            if (options) {
                this.options = {
                    ...this.options,
                    ...options,
                };
            }
            logger_1.Logger.debug(`🥷 Stealth plugin initialized`);
        };
        this.onPageCreated = async (page, context) => {
            logger_1.Logger.debug(`🥷 Applying stealth mode to new page`);
            // Apply additional page-level stealth techniques
            if (this.options.hideWebDriver) {
                await page.evaluateOnNewDocument(() => {
                    // @ts-ignore
                    delete Navigator.prototype.webdriver;
                });
            }
            if (this.options.hideChromeRuntime) {
                await page.evaluateOnNewDocument(() => {
                    // @ts-ignore
                    window.chrome = undefined;
                });
            }
        };
        this.cleanup = async () => {
            logger_1.Logger.debug(`🥷 Stealth plugin cleanup complete`);
        };
        this.options = { ...this.options, ...options };
    }
}
exports.StealthPlugin = StealthPlugin;
//# sourceMappingURL=stealth-plugin.js.map