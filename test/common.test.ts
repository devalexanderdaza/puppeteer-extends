import { describe, it, expect, vi } from "vitest";
import { sleep } from "../src/utils/common";

describe("Common utilities", () => {
  it("sleep should wait for specified time", async () => {
    // Spy on setTimeout
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    
    // Mock setTimeout
    vi.useFakeTimers();
    
    // Start sleep function
    const promise = sleep(2);
    
    // Verify setTimeout was called with correct duration
    expect(vi.getTimerCount()).toBe(1);
    expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 0);
    
    // Fast-forward time
    vi.runAllTimers();
    
    // Verify promise resolves
    await expect(promise).resolves.toBeUndefined();
    
    // Restore timers and clear spy
    vi.useRealTimers();
    setTimeoutSpy.mockRestore();
  });
});