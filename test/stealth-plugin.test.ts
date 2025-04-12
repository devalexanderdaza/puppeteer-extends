import { describe, it, expect, vi, beforeEach } from "vitest";
import { StealthPlugin } from "../src/plugins";

// Mock Logger
vi.mock("../src/utils/logger", () => ({
  Logger: {
    debug: vi.fn(),
  },
}));

describe("StealthPlugin", () => {
  let stealthPlugin: StealthPlugin;
  let mockPage: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create plugin instance
    stealthPlugin = new StealthPlugin({
      hideWebDriver: true,
      hideChromeRuntime: true
    });
    
    // Mock page methods
    mockPage = {
      evaluateOnNewDocument: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("should initialize with default options", async () => {
    const plugin = new StealthPlugin();
    expect(plugin.name).toBe("stealth-plugin");
    expect(plugin.version).toBeDefined();
    
    await plugin.initialize();
  });

  it("should initialize with custom options", async () => {
    const customOptions = {
      hideWebDriver: false,
      hideChromeRuntime: true
    };
    
    await stealthPlugin.initialize(customOptions);
    
    // We expect the options to be merged
    // This is an indirect test as we can't access private members directly
  });

  it("should apply stealth techniques on page created", async () => {
    const context = { page: mockPage };
    
    await stealthPlugin.onPageCreated(mockPage, context as any);
    
    // Should call evaluateOnNewDocument for WebDriver and Chrome runtime
    expect(mockPage.evaluateOnNewDocument).toHaveBeenCalledTimes(2);
  });

  it("should only hide WebDriver when configured", async () => {
    // Create plugin with only WebDriver hiding
    const plugin = new StealthPlugin({
      hideWebDriver: true,
      hideChromeRuntime: false
    });
    
    await plugin.onPageCreated(mockPage, { page: mockPage } as any);
    
    // Should only call evaluateOnNewDocument once
    expect(mockPage.evaluateOnNewDocument).toHaveBeenCalledTimes(1);
  });

  it("should only hide Chrome runtime when configured", async () => {
    // Create plugin with only Chrome runtime hiding
    const plugin = new StealthPlugin({
      hideWebDriver: false,
      hideChromeRuntime: true
    });
    
    await plugin.onPageCreated(mockPage, { page: mockPage } as any);
    
    // Should only call evaluateOnNewDocument once
    expect(mockPage.evaluateOnNewDocument).toHaveBeenCalledTimes(1);
  });

  it("should perform cleanup successfully", async () => {
    await stealthPlugin.cleanup();
    // Just verifying it doesn't throw, no assertions needed
  });
});