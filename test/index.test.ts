import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PuppeteerExtends, Logger, BrowserOptions, NavigationOptions } from '../src';
import { BrowserFactory } from '../src/browser';
import { NavigationService } from '../src/navigation';

// Mock dependencies
vi.mock('../src/browser/browser-factory', () => ({
  BrowserFactory: {
    getBrowser: vi.fn(),
    closeBrowser: vi.fn(),
    closeAllBrowsers: vi.fn()
  }
}));

vi.mock('../src/navigation/navigation-service', () => ({
  NavigationService: {
    goto: vi.fn(),
    closePage: vi.fn(),
    waitForNavigation: vi.fn(),
    waitForSelector: vi.fn()
  }
}));

vi.mock('../src/utils/logger', () => ({
  Logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    configure: vi.fn()
  }
}));

describe('Public API', () => {
  const mockPage = {} as any;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export PuppeteerExtends and Logger', () => {
    expect(PuppeteerExtends).toBeDefined();
    expect(Logger).toBeDefined();
  });

  it('should export type definitions', () => {
    // Just checking that the types are exported - TypeScript will validate this
    const options: BrowserOptions = { isHeadless: true };
    const navOptions: NavigationOptions = { timeout: 5000 };
    
    expect(options).toBeDefined();
    expect(navOptions).toBeDefined();
  });

  it('should have DEFAULT_BROWSER_ARGS export', () => {
    expect(Array.isArray(PuppeteerExtends.DEFAULT_BROWSER_ARGS)).toBe(true);
    expect(PuppeteerExtends.DEFAULT_BROWSER_ARGS.length).toBeGreaterThan(0);
    expect(PuppeteerExtends.DEFAULT_BROWSER_ARGS).toContain('--no-sandbox');
  });

  describe('browser methods', () => {
    it('should call BrowserFactory.getBrowser when PuppeteerExtends.getBrowser is called', async () => {
      const options = { isHeadless: true };
      await PuppeteerExtends.getBrowser(options);
      
      expect(BrowserFactory.getBrowser).toHaveBeenCalledWith(options);
    });

    it('should call BrowserFactory.closeBrowser when PuppeteerExtends.closeBrowser is called', async () => {
      await PuppeteerExtends.closeBrowser('test-id');
      
      expect(BrowserFactory.closeBrowser).toHaveBeenCalledWith('test-id');
    });

    it('should call BrowserFactory.closeAllBrowsers when PuppeteerExtends.closeAllBrowsers is called', async () => {
      await PuppeteerExtends.closeAllBrowsers();
      
      expect(BrowserFactory.closeAllBrowsers).toHaveBeenCalled();
    });
  });

  describe('navigation methods', () => {
    it('should call NavigationService.goto when PuppeteerExtends.goto is called', async () => {
      const url = 'https://example.com';
      const options = { timeout: 5000 };
      
      await PuppeteerExtends.goto(mockPage, url, options);
      
      expect(NavigationService.goto).toHaveBeenCalledWith(mockPage, url, options);
    });

    it('should call NavigationService.closePage when PuppeteerExtends.closePage is called', async () => {
      await PuppeteerExtends.closePage(mockPage);
      
      expect(NavigationService.closePage).toHaveBeenCalledWith(mockPage);
    });

    it('should call NavigationService.waitForNavigation when PuppeteerExtends.waitForNavigation is called', async () => {
      const options = { waitUntil: ['load'] as any, timeout: 5000 };
      
      await PuppeteerExtends.waitForNavigation(mockPage, options);
      
      expect(NavigationService.waitForNavigation).toHaveBeenCalledWith(mockPage, options);
    });

    it('should call NavigationService.waitForSelector when PuppeteerExtends.waitForSelector is called', async () => {
      const selector = '.my-element';
      const timeout = 5000;
      
      await PuppeteerExtends.waitForSelector(mockPage, selector, timeout);
      
      expect(NavigationService.waitForSelector).toHaveBeenCalledWith(mockPage, selector, timeout);
    });
  });
});