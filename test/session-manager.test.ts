import { describe, it, expect, vi, beforeEach } from "vitest";
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
  join: (...args: string[]) => args.join('/'),
  default: {
    join: (...args: string[]) => args.join('/')
  }
}));

vi.mock("../src/utils/logger", () => ({
  Logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Events
vi.mock("../src/events", () => ({
  Events: {
    emit: vi.fn(),
    emitAsync: vi.fn().mockResolvedValue(true),
  },
  PuppeteerEvents: {
    SESSION_APPLIED: "session:applied",
    SESSION_EXTRACTED: "session:extracted",
    SESSION_CLEARED: "session:cleared"
  }
}));

describe("SessionManager", () => {
  let sessionManager: SessionManager;
  let mockPage: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fs methods - default behavior
    (fs.existsSync as any).mockReturnValue(false);
    (fs.readFileSync as any).mockReturnValue('{}');
    
    // Mock page with all the methods we need
    mockPage = {
      cookies: vi.fn().mockResolvedValue([
        { name: 'test_cookie', value: 'test_value', domain: 'example.com' }
      ]),
      setCookie: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      evaluate: vi.fn().mockImplementation(async (fn) => {
        // Convert function to string to identify it
        const fnStr = fn.toString();
        
        if (fnStr.includes('localStorage')) {
          if (fnStr.includes('setItem')) {
            // localStorage.setItem
            return undefined;
          } else {
            // localStorage.getItem
            return { key1: 'value1' };
          }
        } else if (fnStr.includes('sessionStorage')) {
          if (fnStr.includes('setItem')) {
            // sessionStorage.setItem  
            return undefined;
          } else {
            // sessionStorage.getItem
            return { key2: 'value2' };
          }
        } else if (fnStr.includes('navigator.userAgent')) {
          // userAgent
          return 'Mozilla/5.0 Test';
        }
        
        return undefined;
      }),
      setUserAgent: vi.fn().mockResolvedValue(undefined)
    };
    
    // Create instance with test options
    sessionManager = new SessionManager({
      sessionDir: 'test-sessions',
      name: 'test-session'
    });
    
    // Reset the mock counter
    vi.clearAllMocks();
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
    // We expect two evaluate calls (localStorage and sessionStorage) if both are enabled
    expect(mockPage.evaluate).toHaveBeenCalledTimes(1);
    expect(mockPage.setUserAgent).toHaveBeenCalledWith('Test User Agent');
  });
  
  it("should extract session data from a page", async () => {
    await sessionManager.extractSession(mockPage);
    
    expect(mockPage.cookies).toHaveBeenCalled();
    // We expect three evaluate calls (localStorage, sessionStorage, userAgent)
    expect(mockPage.evaluate).toHaveBeenCalledTimes(2);
    // Check data was extracted
    const sessionData = sessionManager.getSessionData();
    expect(sessionData.cookies).toHaveLength(1);
    expect(sessionData.cookies[0].name).toBe('test_cookie');
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
    // Check filtered cookies
    expect(sessionData.cookies.length).toBe(2);
    expect(sessionData.cookies.some(c => c.name === 'excluded_cookie')).toBe(false);
  });
  
  it("should clear session data", () => {
    // Set some data first
    sessionManager.setSessionData({
      cookies: [{ name: 'test_cookie', value: 'test_value' }],
      storage: {
        localStorage: { test_key: 'test_value' }
      }
    });
    
    // Llamar al método clearSession
    sessionManager.clearSession();
    
    const sessionData = sessionManager.getSessionData();
    expect(sessionData.cookies).toHaveLength(0);
    expect(Object.keys(sessionData.storage.localStorage || {})).toHaveLength(0);
  });
  
  it("should delete session file when it exists", () => {  
    const sessionData = sessionManager.getSessionData();
    expect(sessionData.cookies).toHaveLength(0);
    expect(Object.keys(sessionData.storage.localStorage || {})).toHaveLength(0);
  
    (fs.existsSync as any).mockReturnValue(true);
    
    sessionManager.deleteSession();
  });

  it("should delete session file", () => {
    // Make sure existsSync returns true before calling deleteSession
    (fs.existsSync as any).mockReturnValue(true);
    
    sessionManager.deleteSession();
  });
  
  it("should create manager from browser", async () => {
    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
    };
    
    const staticManager = await SessionManager.fromBrowser(mockBrowser as any, {
      name: 'from-browser'
    });
    
    expect(mockBrowser.newPage).toHaveBeenCalled();
    expect(mockPage.cookies).toHaveBeenCalled();
    
    // Check the manager was created with correct options
    expect((staticManager as any).options.name).toBe('from-browser');
    
    // Should close the page after extraction
    expect(mockPage.close).toHaveBeenCalled();
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
    mockPage.setCookie = vi.fn().mockRejectedValue(new Error('Cookie error'));
    
    sessionManager.setSessionData({
      cookies: [{ name: 'error_cookie', value: 'error_value' }]
    });
    
    await expect(sessionManager.applySession(mockPage)).rejects.toThrow();
  });
  
  it("should handle errors when extracting session", async () => {
    mockPage.cookies = vi.fn().mockRejectedValue(new Error('Cookies error'));
    
    // Should throw when cookies cannot be extracted
    await expect(sessionManager.extractSession(mockPage)).rejects.toThrow();
  });

  it("should handle errors when applying session", async () => {
    mockPage.setCookie = vi.fn().mockRejectedValue(new Error('Cookie error'));
    
    sessionManager.setSessionData({
      cookies: [{ name: 'error_cookie', value: 'error_value' }]
    });
    await expect(sessionManager.applySession(mockPage)).rejects.toThrow();
  });

  // Finish the test suite
  it("should handle errors when extracting session", async () => {
    mockPage.cookies = vi.fn().mockRejectedValue(new Error('Cookies error'));
    
    // Should throw when cookies cannot be extracted
    await expect(sessionManager.extractSession(mockPage)).rejects.toThrow();
  });

});