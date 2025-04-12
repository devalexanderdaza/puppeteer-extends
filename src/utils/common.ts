/**
 * Wait for a specified number of seconds
 * @param seconds Number of seconds to wait
 * @returns Promise that resolves after the specified time
 */
export async function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }