import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SessionManager } from "../src/session";
import * as fs from 'fs';
import * as path from 'path';

// Mock dependencies
vi.mock('fs', () => ({
  mkdirSync: vi.fn(),
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn()
}));

vi.mock('path', () => ({
  join: (...args: string[]) => args.join('/')
}));

vi.mock("../src/utils/logger", () => ({
  Logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("SessionManager", () => {
  let sessionManager: SessionManager;
  let mockPage: any;
  let mockBrowser: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fs methods
    (fs.existsSync as any).mockReturnValue(false);
    
    // Mock page with all the methods we need
    mockPage = {
      cookies: vi.fn().mockResolvedValue([
        { name: 'test_cookie', value: 'test_value', domain: 'example.com' }
      ]),
      setCookie: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockImplementation(async (fn) => {
        // Mock different evaluate calls based on the function passed
        const fnStr = fn.toString();
        
        if (fnStr.includes('localStorage')) {
          if (fnStr.includes('setItem')) {
            // This is the applySession localStorage call
            return undefined;
          } else {
            // This is the extractSession localStorage call
            return { key1: 'value1' };
          }
        } else if (fnStr.includes('sessionStorage')) {
          if (fnStr.includes('setItem')) {
            // This is the applySession sessionStorage call
            return undefined;
          } else {
            // This is the extractSession sessionStorage call
            return { key2: 'value2' };
          }
        } else if (fnStr.includes('navigator.userAgent')) {
          return 'Mozilla/5.0 Test';
        }
        
        return undefined;
      }),
      setUserAgent: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined)
    };
    
    // Mock Browser with newPage method
    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage)
    };
    
    // Create instance with test options
    sessionManager = new SessionManager({
      sessionDir: 'test-sessions',
      name: 'test-session'
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it("should create SessionManager with default options", () => {
    const manager = new SessionManager();
    expect(manager).toBeInstanceOf(SessionManager);
    expect(manager.getSessionData()).toEqual({
      cookies: [],
      storage: {},
      userAgent: undefined,
      lastAccessed: undefined
    });
  });
  
  it("should load existing session from disk", () => {
    // Mock fs to return existing session
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify({
      cookies: [{ name: 'saved_cookie', value: 'saved_value' }],
      storage: { localStorage: { saved_key: 'saved_value' } },
      lastAccessed: Date.now()
    }));
    
    // Create new instance that should load the session
    const manager = new SessionManager();
    
    expect(fs.readFileSync).toHaveBeenCalled();
    
    // Check session data was loaded correctly
    const sessionData = manager.getSessionData();
    expect(sessionData.cookies[0].name).toBe('saved_cookie');
    expect(sessionData.storage.localStorage?.saved_key).toBe('saved_value');
  });
  
  it("should apply session data to a page", async () => {
    // Set some session data manually
    sessionManager.setSessionData({
      cookies: [{ name: 'test_cookie', value: 'test_value' }],
      storage: {
        localStorage: { test_key: 'test_value' },
        sessionStorage: { test_session_key: 'test_session_value' }
      },
      userAgent: 'Test User Agent'
    });
    
    await sessionManager.applySession(mockPage);
    
    expect(mockPage.setCookie).toHaveBeenCalled();
    expect(mockPage.evaluate).toHaveBeenCalledTimes(2); // localStorage and sessionStorage
    expect(mockPage.setUserAgent).toHaveBeenCalledWith('Test User Agent');
  });
  
  it("should extract session data from a page", async () => {
    await sessionManager.extractSession(mockPage);
    
    expect(mockPage.cookies).toHaveBeenCalled();
    expect(mockPage.evaluate).toHaveBeenCalledTimes(3); // localStorage, sessionStorage, userAgent
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // Check data was extracted
    const sessionData = sessionManager.getSessionData();
    expect(sessionData.cookies).toHaveLength(1);
    expect(sessionData.cookies[0].name).toBe('test_cookie');
    expect(sessionData.storage.localStorage?.key1).toBe('value1');
    expect(sessionData.storage.sessionStorage?.key2).toBe('value2');
    expect(sessionData.userAgent).toBe('Mozilla/5.0 Test');
  });
  
  it("should filter cookies by domain", async () => {
    // Create session manager with domains filter
    const domainsManager = new SessionManager({
      domains: ['example.com']
    });
    
    // Mock cookies with different domains
    mockPage.cookies.mockResolvedValue([
      { name: 'included_cookie', value: 'value1', domain: 'example.com' },
      { name: 'subdomain_cookie', value: 'value2', domain: 'sub.example.com' },
      { name: 'excluded_cookie', value: 'value3', domain: 'other.com' }
    ]);
    
    await domainsManager.extractSession(mockPage);
    
    const sessionData = domainsManager.getSessionData();
    expect(sessionData.cookies).toHaveLength(2);
    expect(sessionData.cookies[0].name).toBe('included_cookie');
    expect(sessionData.cookies[1].name).toBe('subdomain_cookie');
  });
  
  it("should clear session data", () => {
    // Set some data first
    sessionManager.setSessionData({
      cookies: [{ name: 'test_cookie', value: 'test_value' }],
      storage: {
        localStorage: { test_key: 'test_value' }
      }
    });
    
    sessionManager.clearSession();
    
    const sessionData = sessionManager.getSessionData();
    expect(sessionData.cookies).toHaveLength(0);
    expect(Object.keys(sessionData.storage.localStorage || {})).toHaveLength(0);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
  
  it("should delete session file", () => {
    (fs.existsSync as any).mockReturnValue(true);
    
    sessionManager.deleteSession();
    
    expect(fs.unlinkSync).toHaveBeenCalled();
    
    const sessionData = sessionManager.getSessionData();
    expect(sessionData.cookies).toHaveLength(0);
  });
  
  it("should create manager from page", async () => {
    const staticManager = await SessionManager.fromPage(mockPage, {
      name: 'from-page'
    });
    
    expect(mockPage.cookies).toHaveBeenCalled();
    expect(mockPage.evaluate).toHaveBeenCalled();
    
    // Check the manager was created with correct options
    expect((staticManager as any).options.name).toBe('from-page');
  });
  
  it("should create manager from browser", async () => {
    const staticManager = await SessionManager.fromBrowser(mockBrowser, {
      name: 'from-browser'
    });
    
    expect(mockBrowser.newPage).toHaveBeenCalled();
    expect(mockPage.cookies).toHaveBeenCalled();
    expect(mockPage.evaluate).toHaveBeenCalled();
    expect(mockPage.close).toHaveBeenCalled();
    
    // Check the manager was created with correct options
    expect((staticManager as any).options.name).toBe('from-browser');
  });
  
  it("should handle errors when loading session", () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockImplementation(() => {
      throw new Error('Read error');
    });
    
    // Should not throw when encountering errors
    expect(() => new SessionManager()).not.toThrow();
  });
  
  it("should handle errors when saving session", () => {
    (fs.writeFileSync as any).mockImplementation(() => {
      throw new Error('Write error');
    });
    
    // Should not throw when encountering errors
    expect(() => sessionManager.setSessionData({})).not.toThrow();
  });
  
  it("should handle errors when applying session", async () => {
    mockPage.setCookie.mockRejectedValue(new Error('Cookie error'));
    
    sessionManager.setSessionData({
      cookies: [{ name: 'error_cookie', value: 'error_value' }]
    });
    
    await expect(sessionManager.applySession(mockPage)).rejects.toThrow('Failed to apply session: Cookie error');
  });
  
  it("should handle errors when extracting session", async () => {
    mockPage.cookies.mockRejectedValue(new Error('Extraction error'));
    
    await expect(sessionManager.extractSession(mockPage)).rejects.toThrow('Failed to extract session: Extraction error');
  });
  
  it("should handle errors when deleting session file", () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.unlinkSync as any).mockImplementation(() => {
      throw new Error('Delete error');
    });
    
    // Should not throw when encountering errors
    expect(() => sessionManager.deleteSession()).not.toThrow();
  });
});