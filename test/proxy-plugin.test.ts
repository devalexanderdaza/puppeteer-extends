import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProxyPlugin, Proxy } from "../src/plugins";

// Mock Logger
vi.mock("../src/utils/logger", () => ({
  Logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ProxyPlugin", () => {
  const sampleProxies: Proxy[] = [
    { host: "127.0.0.1", port: 8080 },
    { host: "127.0.0.1", port: 8081, username: "user", password: "pass" },
    { host: "127.0.0.1", port: 8082, protocol: "socks5" },
  ];

  let proxyPlugin: ProxyPlugin;
  let options: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    options = {
      proxies: [...sampleProxies],
      rotationStrategy: "sequential",
      rotateOnNavigation: true,
      rotateOnError: true,
    };
    
    proxyPlugin = new ProxyPlugin(options);
  });

  it("should initialize with provided proxies", async () => {
    expect(proxyPlugin.name).toBe("proxy-plugin");
    expect(proxyPlugin.version).toBeDefined();
  });

  it("should throw error when initialized without proxies", () => {
    expect(() => new ProxyPlugin({ proxies: [] })).toThrow("ProxyPlugin requires at least one proxy");
  });

  it("should update options during initialization", async () => {
    const newOptions = {
      rotationStrategy: "random",
      rotateOnNavigation: false,
    };
    
    await proxyPlugin.initialize(newOptions);
    
    // Indirectly test by using the rotation behavior later
  });

  it("should add proxy argument to browser launch options", async () => {
    const launchOptions = { args: [] };
    const context = { options: {} };
    
    const result = await proxyPlugin.onBeforeBrowserLaunch(launchOptions, context as any);
    
    expect(result.args).toContain(`--proxy-server=http://127.0.0.1:8080`);
  });

  it("should format proxy with authentication", async () => {
    // Set current proxy index to proxy with auth (this is a bit hacky since we're testing a private method)
    // @ts-ignore - Accessing private method for testing
    proxyPlugin["currentProxyIndex"] = 1;
    
    const launchOptions = { args: [] };
    const context = { options: {} };
    
    const result = await proxyPlugin.onBeforeBrowserLaunch(launchOptions, context as any);
    
    expect(result.args).toContain(`--proxy-server=http://user:pass@127.0.0.1:8081`);
  });

  it("should respect protocol in proxy URL", async () => {
    // Set current proxy index to proxy with specific protocol
    // @ts-ignore - Accessing private method for testing
    proxyPlugin["currentProxyIndex"] = 2;
    
    const launchOptions = { args: [] };
    const context = { options: {} };
    
    const result = await proxyPlugin.onBeforeBrowserLaunch(launchOptions, context as any);
    
    expect(result.args).toContain(`--proxy-server=socks5://127.0.0.1:8082`);
  });

  it("should replace existing proxy argument", async () => {
    const launchOptions = { args: ["--proxy-server=old-value"] };
    const context = { options: {} };
    
    const result = await proxyPlugin.onBeforeBrowserLaunch(launchOptions, context as any);
    
    expect(result.args).not.toContain("--proxy-server=old-value");
    expect(result.args).toContain("--proxy-server=http://127.0.0.1:8080");
  });

  it("should rotate proxy before navigation when configured", async () => {
    const context = { browser: {}, options: {} };
    
    await proxyPlugin.onBeforeNavigation({} as any, "https://example.com", {} as any, context as any);
    
    // After rotation, the next proxy should be used (index 1)
    // We can verify this by calling onBeforeBrowserLaunch and checking the result
    const launchOptions = { args: [] };
    const result = await proxyPlugin.onBeforeBrowserLaunch(launchOptions, {} as any);
    
    expect(result.args).toContain(`--proxy-server=http://user:pass@127.0.0.1:8081`);
  });

  it("should not rotate proxy before navigation when disabled", async () => {
    // Create a new plugin with rotation disabled
    const noRotationPlugin = new ProxyPlugin({
      proxies: sampleProxies,
      rotateOnNavigation: false
    });
    
    const context = { browser: {}, options: {} };
    
    await noRotationPlugin.onBeforeNavigation({} as any, "https://example.com", {} as any, context as any);
    
    // The proxy should still be the first one
    const launchOptions = { args: [] };
    const result = await noRotationPlugin.onBeforeBrowserLaunch(launchOptions, {} as any);
    
    expect(result.args).toContain(`--proxy-server=http://127.0.0.1:8080`);
  });

  it("should rotate proxy on network errors when configured", async () => {
    const context = { browser: {}, options: {} };
    const error = new Error("net::ERR_CONNECTION_RESET");
    
    const handled = await proxyPlugin.onError(error, context as any);
    
    expect(handled).toBe(true);
    
    // After rotation, the next proxy should be used (index 1)
    const launchOptions = { args: [] };
    const result = await proxyPlugin.onBeforeBrowserLaunch(launchOptions, {} as any);
    
    expect(result.args).toContain(`--proxy-server=http://user:pass@127.0.0.1:8081`);
  });

  it("should not rotate proxy on non-network errors", async () => {
    const context = { browser: {}, options: {} };
    const error = new Error("Some other error");
    
    const handled = await proxyPlugin.onError(error, context as any);
    
    expect(handled).toBe(false);
    
    // The proxy should still be the first one
    const launchOptions = { args: [] };
    const result = await proxyPlugin.onBeforeBrowserLaunch(launchOptions, {} as any);
    
    expect(result.args).toContain(`--proxy-server=http://127.0.0.1:8080`);
  });

  it("should use random strategy when configured", async () => {
    // Create a plugin with random rotation
    const randomPlugin = new ProxyPlugin({
      proxies: sampleProxies,
      rotationStrategy: "random"
    });
    
    // Mock Math.random to return predictable values
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.7);
    
    const context = { browser: {}, options: {} };
    await randomPlugin.onBeforeNavigation({} as any, "https://example.com", {} as any, context as any);
    
    // With Math.random() = 0.7, we should get index 2 (0.7 * 3 = 2.1, floored to 2)
    const launchOptions = { args: [] };
    const result = await randomPlugin.onBeforeBrowserLaunch(launchOptions, {} as any);
    
    expect(result.args).toContain(`--proxy-server=socks5://127.0.0.1:8082`);
    
    // Restore original Math.random
    randomSpy.mockRestore();
  });

  it("should perform cleanup successfully", async () => {
    await proxyPlugin.cleanup();
    // Just verifying it doesn't throw
  });
});