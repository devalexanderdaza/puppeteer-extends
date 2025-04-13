"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
/**
 * Wait for a specified number of seconds
 * @param seconds Number of seconds to wait
 * @returns Promise that resolves after the specified time
 */
async function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
//# sourceMappingURL=common.js.map