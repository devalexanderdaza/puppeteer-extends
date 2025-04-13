/**
 * @since 1.7.0
 */
import { PuppeteerPlugin, PluginContext } from './plugin-interface';
import { Logger } from '../utils';
import { Events, PuppeteerEvents, PluginEventParams } from '../events';

/**
 * Manages plugin registration and execution
 */
export class PluginManager {
  private static plugins: Map<string, PuppeteerPlugin> = new Map();
  
  /**
   * Register a plugin
   * @param plugin Plugin implementation
   * @param options Plugin options
   */
  public static async registerPlugin(
    plugin: PuppeteerPlugin,
    options?: Record<string, any>
  ): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      Logger.warn(`Plugin '${plugin.name}' is already registered. Skipping.`);
      return;
    }
    
    // Initialize plugin if needed
    if (plugin.initialize) {
      try {
        await plugin.initialize(options);
      } catch (error) {
        Logger.error(`Failed to initialize plugin '${plugin.name}'`, error instanceof Error ? error : String(error));
        throw new Error(`Failed to initialize plugin '${plugin.name}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    this.plugins.set(plugin.name, plugin);
    Logger.debug(`Plugin '${plugin.name}' registered successfully`);

    // Emit plugin registered event
    await Events.emitAsync(PuppeteerEvents.PLUGIN_REGISTERED, {
      pluginName: plugin.name,
      options
    } as PluginEventParams);
  }
  
  /**
   * Unregister a plugin
   * @param pluginName Name of the plugin to unregister
   */
  public static async unregisterPlugin(pluginName: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginName);
    
    if (!plugin) {
      return false;
    }
    
    // Cleanup plugin if needed
    if (plugin.cleanup) {
      try {
        await plugin.cleanup();
      } catch (error) {
        Logger.error(`Error during plugin '${pluginName}' cleanup`, error instanceof Error ? error : String(error));
      }
    }
    
    this.plugins.delete(pluginName);
    Logger.debug(`Plugin '${pluginName}' unregistered`);

    // Emit plugin unregistered event
    await Events.emitAsync(PuppeteerEvents.PLUGIN_UNREGISTERED, {
      pluginName: plugin.name
    } as PluginEventParams);

    return true;
  }
  
  /**
   * Get a plugin by name
   * @param pluginName Plugin name
   */
  public static getPlugin(pluginName: string): PuppeteerPlugin | undefined {
    return this.plugins.get(pluginName);
  }
  
  /**
   * Get all registered plugins
   */
  public static getAllPlugins(): PuppeteerPlugin[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * Execute a hook across all plugins
   * @param hookName Name of the hook to execute
   * @param context Plugin context
   * @param args Arguments to pass to the hook
   */
  public static async executeHook(
    hookName: keyof PuppeteerPlugin,
    context: PluginContext,
    ...args: any[]
  ): Promise<void> {
    for (const plugin of this.plugins.values()) {
      const hook = plugin[hookName];
      
      if (typeof hook === 'function') {
        try {
          await (hook as Function)(...args, context);
        } catch (error) {
          Logger.error(`Error executing hook '${hookName}' in plugin '${plugin.name}'`, error instanceof Error ? error : String(error));
          
          // Emit error event
          await Events.emitAsync(PuppeteerEvents.ERROR, {
            error: error instanceof Error ? error : new Error(String(error)),
            source: `plugin:${plugin.name}`,
            context: { hookName, args }
          });

          // If it's an error hook, we don't want to call the error hook again
          if (hookName !== 'onError' && plugin.onError) {
            try {
              await plugin.onError(
                error instanceof Error ? error : new Error(String(error)),
                context
              );
            } catch (hookError) {
              Logger.error(`Error in error handler of plugin '${plugin.name}'`, hookError instanceof Error ? hookError : String(hookError));
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
  public static async executeErrorHook(
    error: Error,
    context: PluginContext
  ): Promise<boolean> {
    let handled = false;

    // Emit global error event
    await Events.emitAsync(PuppeteerEvents.ERROR, {
      error,
      source: 'plugin-manager',
      context
    });
    
    for (const plugin of this.plugins.values()) {
      if (plugin.onError) {
        try {
          const result = await plugin.onError(error, context);
          handled = handled || result;
        } catch (hookError) {
          // If the error handler itself fails, we log it but don't propagate it
          // to avoid infinite loops
          Logger.error(`Error handler of plugin '${plugin.name}' failed`, hookError instanceof Error ? hookError : String(hookError));
          // Optionally, you could also call the plugin's cleanup method here
          if (plugin.cleanup) {
            try {
              await plugin.cleanup();
            } catch (cleanupError) {
              Logger.error(`Error during cleanup of plugin '${plugin.name}'`, cleanupError instanceof Error ? cleanupError : String(cleanupError));
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
  public static async clearAllPlugins(): Promise<void> {
    for (const name of Array.from(this.plugins.keys())) {
      await this.unregisterPlugin(name);
    }
  }
}