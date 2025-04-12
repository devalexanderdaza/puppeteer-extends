import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger } from "../src/utils/logger";
import path from "path";
import { FolderLogger, ILogOption } from "folder-logger";

// Mock folder-logger
vi.mock("folder-logger", () => {
  return {
    FolderLogger: vi.fn().mockImplementation(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })),
  };
});

describe("Logger", () => {
  const testLogPath = path.join(process.cwd(), "test-logs");

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset internal instance for testing
    // @ts-ignore - access private property for testing
    Logger["instance"] = undefined;
  });

  it("should create a logger instance with default path", () => {
    // Call any method to trigger instance creation
    Logger.debug("Test message");

    // Check if FolderLogger was instantiated with default path
    expect(FolderLogger).toHaveBeenCalledWith(path.join(process.cwd(), "logs"));
  });

  it("should allow configuring custom log path", () => {
    Logger.configure(testLogPath);

    // Verify the instance was created with custom path
    expect(FolderLogger).toHaveBeenCalledWith(testLogPath);
  });

  it("should reuse existing logger instance", () => {
    Logger.debug("First call");
    Logger.info("Second call");

    // FolderLogger should only be instantiated once
    expect(FolderLogger).toHaveBeenCalledTimes(1);
  });

  it("should call debug method with message", () => {
    const message = "Debug message";
    Logger.debug(message);

    // Get the mock instance from constructor call
    const mockInstance = (FolderLogger as any).mock.results[0].value;
    expect(mockInstance.debug).toHaveBeenCalledWith(message, undefined);
  });

  it("should call debug method with message and context", () => {
    const message = "Debug message";
    const context: ILogOption = {
      level: 5,
    };
    Logger.debug(message, context);

    const mockInstance = (FolderLogger as any).mock.results[0].value;
    expect(mockInstance.debug).toHaveBeenCalledWith(message, context);
  });

  it("should call info method with message", () => {
    const message = "Info message";
    Logger.info(message);

    const mockInstance = (FolderLogger as any).mock.results[0].value;
    expect(mockInstance.info).toHaveBeenCalledWith(message, undefined);
  });

  it("should call warn method with message", () => {
    const message = "Warning message";
    Logger.warn(message);

    const mockInstance = (FolderLogger as any).mock.results[0].value;
    expect(mockInstance.warn).toHaveBeenCalledWith(message, undefined);
  });

  it("should call error method with message only", () => {
    const message = "Error message";
    Logger.error(message);

    const mockInstance = (FolderLogger as any).mock.results[0].value;
    expect(mockInstance.error).toHaveBeenCalledWith(message, undefined);
  });

  it("should call error method with message and error object", () => {
    const message = "Error message";
    const error = new Error("Test error");
    Logger.error(message, error);
    const mockInstance = (FolderLogger as any).mock.results[0].value;
    expect(mockInstance.error).toHaveBeenCalledWith(
      `${message} - ${error.message}`,
      undefined,
    );
  });

  it("should call error method with message, error string and context", () => {
    const message = "Error message";
    const errorStr = "Error string";
    const context: ILogOption = {
      level: 3,
    };

    Logger.error(message, errorStr, context);
    const mockInstance = (FolderLogger as any).mock.results[0].value;
    expect(mockInstance.error).toHaveBeenCalledWith(
      `${message} - ${errorStr}`,
      context,
    );
  });
});
