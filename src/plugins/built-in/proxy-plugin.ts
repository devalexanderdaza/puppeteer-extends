/**
 * @since 1.7.0
 */
import { PuppeteerPlugin, PluginContext } from "../plugin-interface";
import { Logger } from "../../utils/logger";

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
export class ProxyPlugin implements PuppeteerPlugin {
  name = "proxy-plugin";
  version = "1.0.0";
  
  private options: ProxyPluginOptions;
  private currentProxyIndex = 0;
  
  constructor(options: ProxyPluginOptions) {
    this.options = {
      rotationStrategy: "sequential",
      rotateOnNavigation: true,
      rotateOnError: true,
      ...options,
      proxies: options.proxies || []
    };
    
    if (!options.proxies || options.proxies.length === 0) {
      throw new Error("ProxyPlugin requires at least one proxy");
    }
  }
  
  // Debemos usar la misma firma que en la interfaz PuppeteerPlugin
  initialize = async (options?: Record<string, any>): Promise<void> => {
    if (options) {
      // Convertir Record<string, any> a ProxyPluginOptions
      this.options = { 
        ...this.options,
        ...options as unknown as ProxyPluginOptions
      };
    }
    Logger.debug(`🔄 Proxy plugin initialized with ${this.options.proxies.length} proxies`);
  }
  
  onBeforeBrowserLaunch = async (options: any, context: PluginContext): Promise<any> => {
    const proxy = this.getCurrentProxy();
    const args = options.args || [];
    
    // Format proxy auth string if needed
    let proxyAuth = '';
    if (proxy.username && proxy.password) {
      proxyAuth = `${proxy.username}:${proxy.password}@`;
    }
    
    // Format proxy URL
    const proxyUrl = `${proxy.protocol || 'http'}://${proxyAuth}${proxy.host}:${proxy.port}`;
    
    // Add or replace proxy argument
    const proxyArg = `--proxy-server=${proxyUrl}`;
    const existingIndex = args.findIndex((arg: string) => arg.startsWith('--proxy-server='));
    
    if (existingIndex >= 0) {
      args[existingIndex] = proxyArg;
    } else {
      args.push(proxyArg);
    }
    
    Logger.debug(`🔄 Using proxy: ${proxy.host}:${proxy.port}`);
    
    return {
      ...options,
      args
    };
  }
  
  onBeforeNavigation = async (page: any, url: string, options: any, context: PluginContext): Promise<void> => {
    if (this.options.rotateOnNavigation && context.browser) {
      this.rotateProxy();
      Logger.debug(`🔄 Rotated proxy before navigation to: ${url}`);
    }
  }
  
  onError = async (error: Error, context: PluginContext): Promise<boolean> => {
    if (
      this.options.rotateOnError &&
      error.message.includes('net::') && 
      context.browser
    ) {
      this.rotateProxy();
      Logger.debug(`🔄 Rotated proxy after error: ${error.message}`);
      return true; // Signal that we handled the error
    }
    return false;
  }
  
  cleanup = async (): Promise<void> => {
    Logger.debug(`🔄 Proxy plugin cleanup complete`);
  }
  
  /**
   * Get current proxy
   */
  private getCurrentProxy(): Proxy {
    return this.options.proxies[this.currentProxyIndex];
  }
  
  /**
   * Rotate to next proxy based on strategy
   */
  private rotateProxy(): Proxy {
    if (this.options.rotationStrategy === "random") {
      this.currentProxyIndex = Math.floor(Math.random() * this.options.proxies.length);
    } else {
      // Sequential rotation
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.options.proxies.length;
    }
    return this.getCurrentProxy();
  }
}