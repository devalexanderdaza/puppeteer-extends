import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PluginManager, PuppeteerPlugin } from "../src/plugins";

// Mock Logger
vi.mock("../src/utils/logger", () => ({
  Logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("PluginManager", () => {
  // Create a mock plugin for testing
  const createMockPlugin = (name: string): PuppeteerPlugin => ({
    name,
    initialize: vi.fn().mockResolvedValue(undefined),
    cleanup: vi.fn().mockResolvedValue(undefined),
    onBeforeBrowserLaunch: vi.fn(),
    onAfterBrowserLaunch: vi.fn(),
    onPageCreated: vi.fn(),
    onBeforeNavigation: vi.fn(),
    onAfterNavigation: vi.fn(),
    onError: vi.fn().mockImplementation(() => Promise.resolve(false)),
  });

  beforeEach(async () => {
    // Clear all plugins before each test
    await PluginManager.clearAllPlugins();
  });

  it("should register a plugin", async () => {
    const plugin = createMockPlugin("test-plugin");
    await PluginManager.registerPlugin(plugin);

    const registeredPlugin = PluginManager.getPlugin("test-plugin");
    expect(registeredPlugin).toBe(plugin);
    expect(plugin.initialize).toHaveBeenCalled();
  });

  it("should not register a plugin twice", async () => {
    const plugin = createMockPlugin("test-plugin");
    await PluginManager.registerPlugin(plugin);
    await PluginManager.registerPlugin(plugin);

    expect(PluginManager.getAllPlugins().length).toBe(1);
  });

  it("should unregister a plugin", async () => {
    const plugin = createMockPlugin("test-plugin");
    await PluginManager.registerPlugin(plugin);
    
    const result = await PluginManager.unregisterPlugin("test-plugin");
    
    expect(result).toBe(true);
    expect(plugin.cleanup).toHaveBeenCalled();
    expect(PluginManager.getPlugin("test-plugin")).toBeUndefined();
  });

  it("should return false when unregistering a non-existent plugin", async () => {
    const result = await PluginManager.unregisterPlugin("non-existent");
    expect(result).toBe(false);
  });

  it("should execute hooks on all plugins", async () => {
    const plugin1 = createMockPlugin("plugin1");
    const plugin2 = createMockPlugin("plugin2");
    
    await PluginManager.registerPlugin(plugin1);
    await PluginManager.registerPlugin(plugin2);
    
    const context = { options: {} };
    await PluginManager.executeHook("onBeforeBrowserLaunch", context, { args: [] });
    
    expect(plugin1.onBeforeBrowserLaunch).toHaveBeenCalled();
    expect(plugin2.onBeforeBrowserLaunch).toHaveBeenCalled();
  });

  it("should handle errors in hooks", async () => {
    const plugin = createMockPlugin("error-plugin");
    (plugin.onBeforeBrowserLaunch as any).mockRejectedValue(new Error("Hook error"));
    
    await PluginManager.registerPlugin(plugin);
    
    const context = { options: {} };
    await PluginManager.executeHook("onBeforeBrowserLaunch", context, { args: [] });
    
    // Should have called the error hook
    expect(plugin.onError).toHaveBeenCalled();
  });

  it("should execute error hooks and return true if handled", async () => {
    const plugin = createMockPlugin("error-handler");
    (plugin.onError as any).mockResolvedValue(true);
    
    await PluginManager.registerPlugin(plugin);
    
    const error = new Error("Test error");
    const context = { options: {} };
    const handled = await PluginManager.executeErrorHook(error, context);
    
    expect(handled).toBe(true);
    expect(plugin.onError).toHaveBeenCalledWith(error, context);
  });

  it("should clear all plugins", async () => {
    await PluginManager.registerPlugin(createMockPlugin("plugin1"));
    await PluginManager.registerPlugin(createMockPlugin("plugin2"));
    
    expect(PluginManager.getAllPlugins().length).toBe(2);
    
    await PluginManager.clearAllPlugins();
    
    expect(PluginManager.getAllPlugins().length).toBe(0);
  });
});