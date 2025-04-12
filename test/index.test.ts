import { describe, it, expect, vi } from 'vitest';
import { PuppeteerExtends, Logger } from '../src';
import { Browser } from 'puppeteer';

describe('Public API', () => {
  it('should export PuppeteerExtends and Logger', () => {
    expect(PuppeteerExtends).toBeDefined();
    expect(Logger).toBeDefined();
  });

  it('should have all required methods on PuppeteerExtends', () => {
    expect(typeof PuppeteerExtends.getBrowser).toBe('function');
    expect(typeof PuppeteerExtends.closeBrowser).toBe('function');
    expect(typeof PuppeteerExtends.closeAllBrowsers).toBe('function');
    expect(typeof PuppeteerExtends.goto).toBe('function');
    expect(typeof PuppeteerExtends.closePage).toBe('function');
    expect(typeof PuppeteerExtends.waitForNavigation).toBe('function');
    expect(typeof PuppeteerExtends.waitForSelector).toBe('function');
  });

  it('should have all required methods on Logger', () => {
    expect(typeof Logger.debug).toBe('function');
    expect(typeof Logger.info).toBe('function');
    expect(typeof Logger.warn).toBe('function');
    expect(typeof Logger.error).toBe('function');
    expect(typeof Logger.configure).toBe('function');
  });
});

describe('PuppeteerExtends functionality', () => {
  it('should call BrowserFactory.getBrowser when getBrowser is invoked', async () => {
    const mockGetBrowser = vi.spyOn(PuppeteerExtends, 'getBrowser').mockImplementation(() => Promise.resolve({} as Browser));
    const result = await PuppeteerExtends.getBrowser();
    expect(mockGetBrowser).toHaveBeenCalled();
    expect(result).toEqual({});
    mockGetBrowser.mockRestore();
  });

  it('should call BrowserFactory.closeBrowser when closeBrowser is invoked', async () => {
    const mockCloseBrowser = vi.spyOn(PuppeteerExtends, 'closeBrowser').mockImplementation(() => Promise.resolve());
    const result = await PuppeteerExtends.closeBrowser('testInstance');
    expect(mockCloseBrowser).toHaveBeenCalledWith('testInstance');
    expect(result).toBeUndefined();
    mockCloseBrowser.mockRestore();
  });

  it('should call BrowserFactory.closeAllBrowsers when closeAllBrowsers is invoked', async () => {
    const mockCloseAllBrowsers = vi.spyOn(PuppeteerExtends, 'closeAllBrowsers').mockImplementation(() => Promise.resolve());
    const result = await PuppeteerExtends.closeAllBrowsers();
    expect(mockCloseAllBrowsers).toHaveBeenCalled();
    expect(result).toBeUndefined();
    mockCloseAllBrowsers.mockRestore();
  });

  it('should call NavigationService.goto when goto is invoked', async () => {
    const mockGoto = vi.spyOn(PuppeteerExtends, 'goto').mockImplementation(() => Promise.resolve(true));
    const result = await PuppeteerExtends.goto({}, 'http://example.com');
    expect(mockGoto).toHaveBeenCalledWith({}, 'http://example.com');
    expect(result).toBe(true);
    mockGoto.mockRestore();
  });

  it('should call NavigationService.closePage when closePage is invoked', async () => {
    const mockClosePage = vi.spyOn(PuppeteerExtends, 'closePage').mockImplementation(() => Promise.resolve());
    const result = await PuppeteerExtends.closePage({});
    expect(mockClosePage).toHaveBeenCalledWith({});
    expect(result).toBeUndefined();
    mockClosePage.mockRestore();
  });

  it('should call NavigationService.waitForNavigation when waitForNavigation is invoked', async () => {
    const mockWaitForNavigation = vi.spyOn(PuppeteerExtends, 'waitForNavigation').mockImplementation(() => Promise.resolve(true));
    const result = await PuppeteerExtends.waitForNavigation({}, { waitUntil: ['load'], timeout: 5000 });
    expect(mockWaitForNavigation).toHaveBeenCalledWith({}, { waitUntil: ['load'], timeout: 5000 });
    expect(result).toBe(true);
    mockWaitForNavigation.mockRestore();
  });

  it('should call NavigationService.waitForSelector when waitForSelector is invoked', async () => {
    const mockWaitForSelector = vi.spyOn(PuppeteerExtends, 'waitForSelector').mockImplementation(() => Promise.resolve(true));
    const result = await PuppeteerExtends.waitForSelector({}, '.test-selector', 3000);
    expect(mockWaitForSelector).toHaveBeenCalledWith({}, '.test-selector', 3000);
    expect(result).toBe(true);
    mockWaitForSelector.mockRestore();
  });
});