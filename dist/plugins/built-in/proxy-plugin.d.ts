/**
 * @since 1.7.0
 */
import { PuppeteerPlugin, PluginContext } from "../plugin-interface";
export interface Proxy {
    host: string;
    port: number;
    username?: string;
    password?: string;
    protocol?: "http" | "https" | "socks4" | "socks5";
}
export interface ProxyPluginOptions {
    /**
     * List of available proxies
     * @default []
     */
    proxies: Proxy[];
    /**
     * Proxy rotation strategy
     * @default "sequential"
     */
    rotationStrategy?: "sequential" | "random";
    /**
     * Rotate proxy on each navigation
     * @default true
     */
    rotateOnNavigation?: boolean;
    /**
     * Rotate proxy on navigation errors
     * @default true
     */
    rotateOnError?: boolean;
}
/**
 * ProxyPlugin provides proxy rotation functionality for browser instances
 */
export declare class ProxyPlugin implements PuppeteerPlugin {
    name: string;
    version: string;
    private options;
    private currentProxyIndex;
    constructor(options: ProxyPluginOptions);
    initialize: (options?: Record<string, any>) => Promise<void>;
    onBeforeBrowserLaunch: (options: any, context: PluginContext) => Promise<any>;
    onBeforeNavigation: (page: any, url: string, options: any, context: PluginContext) => Promise<void>;
    onError: (error: Error, context: PluginContext) => Promise<boolean>;
    cleanup: () => Promise<void>;
    /**
     * Get current proxy
     */
    private getCurrentProxy;
    /**
     * Rotate to next proxy based on strategy
     */
    private rotateProxy;
}
