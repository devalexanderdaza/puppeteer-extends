import puppeteerExtra from 'puppeteer-extra';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserFactory } from '../src/browser';

// Mock dependencies
vi.mock('puppeteer-extra', () => {
  return {
    default: {
      use: vi.fn(),
      launch: vi.fn().mockResolvedValue({
        on: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
        newPage: vi.fn().mockResolvedValue({})
      }),
      setMaxListeners: vi.fn()
    }
  };
});

vi.mock('puppeteer-extra-plugin-stealth', () => {
  return {
    default: vi.fn().mockReturnValue({})
  };
});

vi.mock('../src/utils/logger', () => {
  return {
    Logger: {
      debug: vi.fn(),
      error: vi.fn()
    }
  };
});

describe('BrowserFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear browser instances between tests
    // @ts-ignore - access private property for testing
    BrowserFactory['instances'] = new Map();
    // @ts-ignore - reset initialized state
    BrowserFactory['initialized'] = false;
  });

  afterEach(async () => {
    await BrowserFactory.closeAllBrowsers();
  });

  it('should handle launch errors', async () => {
    (puppeteerExtra.launch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed to launch browser'));
    
    await expect(BrowserFactory.getBrowser({ isDebug: true }))
      .rejects.toThrow('Failed to launch browser');
  });

  it('should initialize the browser with stealth plugin', async () => {
    await BrowserFactory.getBrowser({ isDebug: true });
    
    expect(puppeteerExtra.use).toHaveBeenCalledWith(expect.anything());
    expect(puppeteerExtra.launch).toHaveBeenCalled();
  });

  it('should create a browser instance with default options', async () => {
    const browser = await BrowserFactory.getBrowser();
    expect(browser).toBeDefined();
    
    // Should use default instance ID
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].has('default')).toBe(true);
  });

  it('should reuse existing browser instance with same ID', async () => {
    const browser1 = await BrowserFactory.getBrowser({ instanceId: 'test' });
    const browser2 = await BrowserFactory.getBrowser({ instanceId: 'test' });
    
    expect(browser1).toBe(browser2);
    
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].size).toBe(1);
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].get('test')).toBe(browser1);
    expect(puppeteerExtra.launch).toHaveBeenCalledTimes(1);
  });

  it('should create separate instances with different IDs', async () => {
    const browser1 = await BrowserFactory.getBrowser({ instanceId: 'instance1' });
    const browser2 = await BrowserFactory.getBrowser({ instanceId: 'instance2' });
    expect(browser1).toBeDefined();
    expect(browser2).toBeDefined();
    expect(browser1).toBeInstanceOf(Object);
    expect(browser2).toBeInstanceOf(Object);
    
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].size).toBe(2);
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].get('instance1')).toBe(browser1);
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].get('instance2')).toBe(browser2);
    expect(puppeteerExtra.launch).toHaveBeenCalledTimes(2);
  });

  it('should close a specific browser instance', async () => {
    await BrowserFactory.getBrowser({ instanceId: 'test1' });
    await BrowserFactory.getBrowser({ instanceId: 'test2' });
    
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].size).toBe(2);
    
    await BrowserFactory.closeBrowser('test1');
    
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].size).toBe(1);
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].has('test1')).toBe(false);
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].has('test2')).toBe(true);
  });

  it('should close all browser instances', async () => {
    await BrowserFactory.getBrowser({ instanceId: 'test1' });
    await BrowserFactory.getBrowser({ instanceId: 'test2' });
    
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].size).toBe(2);
    
    await BrowserFactory.closeAllBrowsers();
    
    // @ts-ignore - access private property for testing
    expect(BrowserFactory['instances'].size).toBe(0);
  });
});