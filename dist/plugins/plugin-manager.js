"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
const utils_1 = require("../utils");
const events_1 = require("../events");
/**
 * Manages plugin registration and execution
 */
class PluginManager {
    /**
     * Register a plugin
     * @param plugin Plugin implementation
     * @param options Plugin options
     */
    static async registerPlugin(plugin, options) {
        if (this.plugins.has(plugin.name)) {
            utils_1.Logger.warn(`Plugin '${plugin.name}' is already registered. Skipping.`);
            return;
        }
        // Initialize plugin if needed
        if (plugin.initialize) {
            try {
                await plugin.initialize(options);
            }
            catch (error) {
                utils_1.Logger.error(`Failed to initialize plugin '${plugin.name}'`, error instanceof Error ? error : String(error));
                throw new Error(`Failed to initialize plugin '${plugin.name}': ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        this.plugins.set(plugin.name, plugin);
        utils_1.Logger.debug(`Plugin '${plugin.name}' registered successfully`);
        // Emit plugin registered event
        await events_1.Events.emitAsync(events_1.PuppeteerEvents.PLUGIN_REGISTERED, {
            pluginName: plugin.name,
            options,
        });
    }
    /**
     * Unregister a plugin
     * @param pluginName Name of the plugin to unregister
     */
    static async unregisterPlugin(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            return false;
        }
        // Cleanup plugin if needed
        if (plugin.cleanup) {
            try {
                await plugin.cleanup();
            }
            catch (error) {
                utils_1.Logger.error(`Error during plugin '${pluginName}' cleanup`, error instanceof Error ? error : String(error));
            }
        }
        this.plugins.delete(pluginName);
        utils_1.Logger.debug(`Plugin '${pluginName}' unregistered`);
        // Emit plugin unregistered event
        await events_1.Events.emitAsync(events_1.PuppeteerEvents.PLUGIN_UNREGISTERED, {
            pluginName: plugin.name,
        });
        return true;
    }
    /**
     * Get a plugin by name
     * @param pluginName Plugin name
     */
    static getPlugin(pluginName) {
        return this.plugins.get(pluginName);
    }
    /**
     * Get all registered plugins
     */
    static getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    /**
     * Execute a hook across all plugins
     * @param hookName Name of the hook to execute
     * @param context Plugin context
     * @param args Arguments to pass to the hook
     */
    static async executeHook(hookName, context, ...args) {
        for (const plugin of this.plugins.values()) {
            const hook = plugin[hookName];
            if (typeof hook === "function") {
                try {
                    await hook(...args, context);
                }
                catch (error) {
                    utils_1.Logger.error(`Error executing hook '${hookName}' in plugin '${plugin.name}'`, error instanceof Error ? error : String(error));
                    // Emit error event
                    await events_1.Events.emitAsync(events_1.PuppeteerEvents.ERROR, {
                        error: error instanceof Error ? error : new Error(String(error)),
                        source: `plugin:${plugin.name}`,
                        context: { hookName, args },
                    });
                    // If it's an error hook, we don't want to call the error hook again
                    if (hookName !== "onError" && plugin.onError) {
                        try {
                            await plugin.onError(error instanceof Error ? error : new Error(String(error)), context);
                        }
                        catch (hookError) {
                            utils_1.Logger.error(`Error in error handler of plugin '${plugin.name}'`, hookError instanceof Error ? hookError : String(hookError));
                        }
                    }
                }
            }
        }
    }
    /**
     * Execute error hook across all plugins
     * @param error The error that occurred
     * @param context Plugin context
     * @returns true if any plugin handled the error
     */
    static async executeErrorHook(error, context) {
        let handled = false;
        // Emit global error event
        await events_1.Events.emitAsync(events_1.PuppeteerEvents.ERROR, {
            error,
            source: "plugin-manager",
            context,
        });
        for (const plugin of this.plugins.values()) {
            if (plugin.onError) {
                try {
                    const result = await plugin.onError(error, context);
                    handled = handled || result;
                }
                catch (hookError) {
                    // If the error handler itself fails, we log it but don't propagate it
                    // to avoid infinite loops
                    utils_1.Logger.error(`Error handler of plugin '${plugin.name}' failed`, hookError instanceof Error ? hookError : String(hookError));
                    // Optionally, you could also call the plugin's cleanup method here
                    if (plugin.cleanup) {
                        try {
                            await plugin.cleanup();
                        }
                        catch (cleanupError) {
                            utils_1.Logger.error(`Error during cleanup of plugin '${plugin.name}'`, cleanupError instanceof Error
                                ? cleanupError
                                : String(cleanupError));
                        }
                    }
                }
            }
        }
        return handled;
    }
    /**
     * Unregister all plugins and run cleanup
     */
    static async clearAllPlugins() {
        for (const name of Array.from(this.plugins.keys())) {
            await this.unregisterPlugin(name);
        }
    }
}
exports.PluginManager = PluginManager;
PluginManager.plugins = new Map();
//# sourceMappingURL=plugin-manager.js.map