import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavigationService } from '../src/navigation';

describe('NavigationService', () => {
  const mockPage = {
    setRequestInterception: vi.fn(),
    once: vi.fn(),
    on: vi.fn(),
    goto: vi.fn(),
    waitForNavigation: vi.fn(),
    waitForSelector: vi.fn(),
    close: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle request continuation errors', async () => {
    // Mock page with request.continue throwing an error
    const mockErrorPage = {
      ...mockPage,
      once: vi.fn((event, handler) => {
        if (event === 'request') {
          handler({
            continue: vi.fn().mockImplementation(() => {
              throw new Error('Request already handled');
            }),
            headers: vi.fn().mockReturnValue({})
          });
        }
      })
    };
    
    const result = await NavigationService.goto(mockErrorPage as any, 'https://example.com', { isDebug: true });
    expect(mockErrorPage.goto).toHaveBeenCalled();
  });

  describe('goto', () => {
    it('should navigate to URL successfully', async () => {
      // Setup mocks
      mockPage.goto.mockResolvedValueOnce(true);

      const result = await NavigationService.goto(mockPage as any, 'https://example.com');
      
      expect(result).toBe(true);
      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', {
        waitUntil: ['load', 'networkidle0'],
        timeout: 30000
      });
      expect(mockPage.setRequestInterception).toHaveBeenCalledWith(true);
      expect(mockPage.once).toHaveBeenCalledWith('request', expect.any(Function));
    });

    it('should handle navigation errors and retry', async () => {
      // First attempt fails, second succeeds
      mockPage.goto
        .mockRejectedValueOnce(new Error('Navigation timeout'))
        .mockResolvedValueOnce(true);

      const result = await NavigationService.goto(mockPage as any, 'https://example.com', {
        maxRetries: 1,
        retryDelay: 10 // Short delay for tests
      });
      
      expect(result).toBe(true);
      expect(mockPage.goto).toHaveBeenCalledTimes(2);
    });

    it('should return false after all retries fail', async () => {
      // All attempts fail
      mockPage.goto.mockRejectedValue(new Error('Navigation error'));

      const result = await NavigationService.goto(mockPage as any, 'https://example.com', {
        maxRetries: 2,
        retryDelay: 10
      });
      
      expect(result).toBe(false);
      expect(mockPage.goto).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    
    
    it('should reset request interception on error', async () => {
      mockPage.goto.mockRejectedValueOnce(new Error('Navigation error'));
      
      const result = await NavigationService.goto(mockPage as any, 'https://example.com', { maxRetries: 0 });
      
      expect(result).toBe(false);
      expect(mockPage.setRequestInterception).toHaveBeenCalledWith(false);
    });
  });

  describe('waitForNavigation', () => {
    it('should wait for navigation successfully', async () => {
      mockPage.waitForNavigation.mockResolvedValueOnce(true);

      const result = await NavigationService.waitForNavigation(mockPage as any);
      
      expect(result).toBe(true);
      expect(mockPage.waitForNavigation).toHaveBeenCalledWith({
        waitUntil: ['load', 'networkidle0'],
        timeout: 30000
      });
    });

    it('should handle timeout errors', async () => {
      mockPage.waitForNavigation.mockRejectedValueOnce(new Error('Timeout'));

      const result = await NavigationService.waitForNavigation(mockPage as any);
      
      expect(result).toBe(false);
    });
  });

  describe('waitForSelector', () => {
    it('should wait for selector successfully', async () => {
      mockPage.waitForSelector.mockResolvedValueOnce(true);

      const result = await NavigationService.waitForSelector(mockPage as any, '.my-element');
      
      expect(result).toBe(true);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith('.my-element', {
        visible: true,
        timeout: 30000
      });
    });

    it('should handle timeout errors', async () => {
      mockPage.waitForSelector.mockRejectedValueOnce(new Error('Timeout'));

      const result = await NavigationService.waitForSelector(mockPage as any, '.my-element');
      
      expect(result).toBe(false);
    });
  });

  describe('closePage', () => {
    it('should close page successfully', async () => {
      mockPage.close.mockResolvedValueOnce(undefined);

      await NavigationService.closePage(mockPage as any);
      
      expect(mockPage.close).toHaveBeenCalled();
    });

    it('should handle errors when closing page', async () => {
      mockPage.close.mockRejectedValueOnce(new Error('Close error'));

      // Should not throw error
      await expect(NavigationService.closePage(mockPage as any)).resolves.not.toThrow();
    });
  });
});