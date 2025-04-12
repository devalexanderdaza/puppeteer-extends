import { NavigationService } from "../src/navigation";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Logger } from "../src/utils/logger";

// Mock Logger
vi.mock("../src/utils/logger", () => ({
  Logger: {
    debug: vi.fn(),
  },
}));

describe("NavigationService", () => {
  // Mock Page object
  const mockPage = {
    setRequestInterception: vi.fn(),
    goto: vi.fn(),
    waitForNavigation: vi.fn(),
    waitForSelector: vi.fn(),
    close: vi.fn(),
    once: vi.fn(),
  };

  // Mock request object
  const mockRequest = {
    continue: vi.fn(),
    headers: vi.fn().mockReturnValue({ "User-Agent": "test" }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks
    mockPage.once.mockImplementation((event, handler) => {
      if (event === "request") {
        handler(mockRequest);
      }
    });
  });

  describe("goto", () => {
    it("should navigate to URL successfully", async () => {
      mockPage.goto.mockResolvedValueOnce(true);

      const result = await NavigationService.goto(
        mockPage as any,
        "https://example.com",
      );

      expect(result).toBe(true);
      expect(mockPage.setRequestInterception).toHaveBeenCalledTimes(3);
      expect(mockPage.goto).toHaveBeenCalledWith("https://example.com", {
        waitUntil: ["load", "networkidle0"],
        timeout: 30000,
      });
    });

    it("should handle navigation errors and retry", async () => {
      mockPage.goto
        .mockRejectedValueOnce(new Error("Navigation timeout"))
        .mockResolvedValueOnce(true);

      const result = await NavigationService.goto(
        mockPage as any,
        "https://example.com",
        {
          maxRetries: 1,
          retryDelay: 10, // Short delay for tests
        },
      );

      expect(result).toBe(true);
      expect(mockPage.goto).toHaveBeenCalledTimes(2);
    });

    it("should return false after all retries fail", async () => {
      mockPage.goto.mockRejectedValue(new Error("Navigation error"));

      const result = await NavigationService.goto(
        mockPage as any,
        "https://example.com",
        {
          maxRetries: 2,
          retryDelay: 10,
          isDebug: true,
        },
      );

      expect(result).toBe(false);
      expect(mockPage.goto).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(Logger.debug).toHaveBeenCalledWith(
        expect.stringContaining("All navigation attempts failed"),
      );
    });

    it("should use custom navigation options", async () => {
      mockPage.goto.mockResolvedValueOnce(true);

      await NavigationService.goto(mockPage as any, "https://example.com", {
        waitUntil: ["domcontentloaded"],
        timeout: 5000,
        isDebug: true,
      });

      expect(mockPage.goto).toHaveBeenCalledWith("https://example.com", {
        waitUntil: ["domcontentloaded"],
        timeout: 5000,
      });
    });

    it("should handle request continuation errors", async () => {
      // Mock request.continue to throw error
      const errorRequest = {
        ...mockRequest,
        continue: vi.fn().mockImplementation(() => {
          throw new Error("Request already handled");
        }),
      };

      mockPage.once.mockImplementation((event, handler) => {
        if (event === "request") {
          handler(errorRequest);
        }
      });

      mockPage.goto.mockResolvedValueOnce(true);

      const result = await NavigationService.goto(
        mockPage as any,
        "https://example.com",
        {
          isDebug: true,
        },
      );

      expect(result).toBe(true);
      expect(Logger.debug).toHaveBeenCalledWith(
        expect.stringContaining("Request continuation error"),
      );
    });

    it("should apply custom headers to requests", async () => {
      mockPage.goto.mockResolvedValueOnce(true);

      await NavigationService.goto(mockPage as any, "https://example.com", {
        headers: { "Custom-Header": "test-value" },
      });

      expect(mockRequest.continue).toHaveBeenCalledWith({
        headers: expect.objectContaining({
          "User-Agent": "test",
          "Custom-Header": "test-value",
        }),
      });
    });
  });

  describe("waitForNavigation", () => {
    it("should wait for navigation successfully", async () => {
      mockPage.waitForNavigation.mockResolvedValueOnce(true);

      const result = await NavigationService.waitForNavigation(mockPage as any);

      expect(result).toBe(true);
      expect(mockPage.waitForNavigation).toHaveBeenCalledWith({
        waitUntil: ["load", "networkidle0"],
        timeout: 30000,
      });
    });

    it("should handle timeout errors", async () => {
      mockPage.waitForNavigation.mockRejectedValueOnce(new Error("Timeout"));

      const result = await NavigationService.waitForNavigation(mockPage as any);

      expect(result).toBe(false);
    });

    it("should use custom navigation options", async () => {
      mockPage.waitForNavigation.mockResolvedValueOnce(true);

      await NavigationService.waitForNavigation(mockPage as any, {
        waitUntil: ["networkidle2"],
        timeout: 60000,
      });

      expect(mockPage.waitForNavigation).toHaveBeenCalledWith({
        waitUntil: ["networkidle2"],
        timeout: 60000,
      });
    });
  });

  describe("waitForSelector", () => {
    it("should wait for selector successfully", async () => {
      mockPage.waitForSelector.mockResolvedValueOnce(true);

      const result = await NavigationService.waitForSelector(
        mockPage as any,
        ".my-element",
      );

      expect(result).toBe(true);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(".my-element", {
        visible: true,
        timeout: 30000,
      });
    });

    it("should handle timeout errors", async () => {
      mockPage.waitForSelector.mockRejectedValueOnce(new Error("Timeout"));

      const result = await NavigationService.waitForSelector(
        mockPage as any,
        ".my-element",
      );

      expect(result).toBe(false);
    });

    it("should use custom timeout", async () => {
      mockPage.waitForSelector.mockResolvedValueOnce(true);

      await NavigationService.waitForSelector(
        mockPage as any,
        ".my-element",
        10000,
      );

      expect(mockPage.waitForSelector).toHaveBeenCalledWith(".my-element", {
        visible: true,
        timeout: 10000,
      });
    });
  });

  describe("closePage", () => {
    it("should close page successfully", async () => {
      mockPage.close.mockResolvedValueOnce(undefined);

      await NavigationService.closePage(mockPage as any);

      expect(mockPage.close).toHaveBeenCalled();
    });

    it("should handle errors when closing page", async () => {
      mockPage.close.mockRejectedValueOnce(new Error("Close error"));

      // Should not throw error
      await expect(
        NavigationService.closePage(mockPage as any),
      ).resolves.not.toThrow();
    });
  });
});
