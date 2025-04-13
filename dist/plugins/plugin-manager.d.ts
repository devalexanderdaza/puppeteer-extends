/**
 * @since 1.7.0
 */
import { PuppeteerPlugin, PluginContext } from "./plugin-interface";
/**
 * Manages plugin registration and execution
 */
export declare class PluginManager {
    private static plugins;
    /**
     * Register a plugin
     * @param plugin Plugin implementation
     * @param options Plugin options
     */
    static registerPlugin(plugin: PuppeteerPlugin, options?: Record<string, any>): Promise<void>;
    /**
     * Unregister a plugin
     * @param pluginName Name of the plugin to unregister
     */
    static unregisterPlugin(pluginName: string): Promise<boolean>;
    /**
     * Get a plugin by name
     * @param pluginName Plugin name
     */
    static getPlugin(pluginName: string): PuppeteerPlugin | undefined;
    /**
     * Get all registered plugins
     */
    static getAllPlugins(): PuppeteerPlugin[];
    /**
     * Execute a hook across all plugins
     * @param hookName Name of the hook to execute
     * @param context Plugin context
     * @param args Arguments to pass to the hook
     */
    static executeHook(hookName: keyof PuppeteerPlugin, context: PluginContext, ...args: any[]): Promise<void>;
    /**
     * Execute error hook across all plugins
     * @param error The error that occurred
     * @param context Plugin context
     * @returns true if any plugin handled the error
     */
    static executeErrorHook(error: Error, context: PluginContext): Promise<boolean>;
    /**
     * Unregister all plugins and run cleanup
     */
    static clearAllPlugins(): Promise<void>;
}
