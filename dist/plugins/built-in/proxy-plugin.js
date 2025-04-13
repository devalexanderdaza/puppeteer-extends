"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyPlugin = void 0;
const logger_1 = require("../../utils/logger");
/**
 * ProxyPlugin provides proxy rotation functionality for browser instances
 */
class ProxyPlugin {
    constructor(options) {
        this.name = "proxy-plugin";
        this.version = "1.0.0";
        this.currentProxyIndex = 0;
        // Debemos usar la misma firma que en la interfaz PuppeteerPlugin
        this.initialize = async (options) => {
            if (options) {
                // Convertir Record<string, any> a ProxyPluginOptions
                this.options = {
                    ...this.options,
                    ...options,
                };
            }
            logger_1.Logger.debug(`🔄 Proxy plugin initialized with ${this.options.proxies.length} proxies`);
        };
        this.onBeforeBrowserLaunch = async (options, context) => {
            const proxy = this.getCurrentProxy();
            const args = options.args || [];
            // Format proxy auth string if needed
            let proxyAuth = "";
            if (proxy.username && proxy.password) {
                proxyAuth = `${proxy.username}:${proxy.password}@`;
            }
            // Format proxy URL
            const proxyUrl = `${proxy.protocol || "http"}://${proxyAuth}${proxy.host}:${proxy.port}`;
            // Add or replace proxy argument
            const proxyArg = `--proxy-server=${proxyUrl}`;
            const existingIndex = args.findIndex((arg) => arg.startsWith("--proxy-server="));
            if (existingIndex >= 0) {
                args[existingIndex] = proxyArg;
            }
            else {
                args.push(proxyArg);
            }
            logger_1.Logger.debug(`🔄 Using proxy: ${proxy.host}:${proxy.port}`);
            return {
                ...options,
                args,
            };
        };
        this.onBeforeNavigation = async (page, url, options, context) => {
            if (this.options.rotateOnNavigation && context.browser) {
                this.rotateProxy();
                logger_1.Logger.debug(`🔄 Rotated proxy before navigation to: ${url}`);
            }
        };
        this.onError = async (error, context) => {
            if (this.options.rotateOnError &&
                error.message.includes("net::") &&
                context.browser) {
                this.rotateProxy();
                logger_1.Logger.debug(`🔄 Rotated proxy after error: ${error.message}`);
                return true; // Signal that we handled the error
            }
            return false;
        };
        this.cleanup = async () => {
            logger_1.Logger.debug(`🔄 Proxy plugin cleanup complete`);
        };
        this.options = {
            rotationStrategy: "sequential",
            rotateOnNavigation: true,
            rotateOnError: true,
            ...options,
            proxies: options.proxies || [],
        };
        if (!options.proxies || options.proxies.length === 0) {
            throw new Error("ProxyPlugin requires at least one proxy");
        }
    }
    /**
     * Get current proxy
     */
    getCurrentProxy() {
        return this.options.proxies[this.currentProxyIndex];
    }
    /**
     * Rotate to next proxy based on strategy
     */
    rotateProxy() {
        if (this.options.rotationStrategy === "random") {
            this.currentProxyIndex = Math.floor(Math.random() * this.options.proxies.length);
        }
        else {
            // Sequential rotation
            this.currentProxyIndex =
                (this.currentProxyIndex + 1) % this.options.proxies.length;
        }
        return this.getCurrentProxy();
    }
}
exports.ProxyPlugin = ProxyPlugin;
//# sourceMappingURL=proxy-plugin.js.map