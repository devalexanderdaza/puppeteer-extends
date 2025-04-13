"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTypes = exports.Events = exports.PuppeteerEvents = void 0;
const event_emitter_1 = require("./event-emitter");
// Singleton event emitter instance
const eventEmitter = new event_emitter_1.EventEmitter();
// Standard events emitted by puppeteer-extends
var PuppeteerEvents;
(function (PuppeteerEvents) {
    // Browser events
    PuppeteerEvents["BROWSER_CREATED"] = "browser:created";
    PuppeteerEvents["BROWSER_CLOSED"] = "browser:closed";
    // Page events
    PuppeteerEvents["PAGE_CREATED"] = "page:created";
    PuppeteerEvents["PAGE_CLOSED"] = "page:closed";
    // Navigation events
    PuppeteerEvents["NAVIGATION_STARTED"] = "navigation:started";
    PuppeteerEvents["NAVIGATION_SUCCEEDED"] = "navigation:succeeded";
    PuppeteerEvents["NAVIGATION_FAILED"] = "navigation:failed";
    // Error events
    PuppeteerEvents["ERROR"] = "error";
    PuppeteerEvents["NAVIGATION_ERROR"] = "navigation:error";
    PuppeteerEvents["BROWSER_ERROR"] = "browser:error";
    PuppeteerEvents["PAGE_ERROR"] = "page:error";
    // Session events
    PuppeteerEvents["SESSION_APPLIED"] = "session:applied";
    PuppeteerEvents["SESSION_EXTRACTED"] = "session:extracted";
    PuppeteerEvents["SESSION_CLEARED"] = "session:cleared";
    // Plugin events
    PuppeteerEvents["PLUGIN_REGISTERED"] = "plugin:registered";
    PuppeteerEvents["PLUGIN_UNREGISTERED"] = "plugin:unregistered";
})(PuppeteerEvents || (exports.EventTypes = exports.PuppeteerEvents = PuppeteerEvents = {}));
// Export the singleton instance
exports.Events = {
    /**
     * Register an event listener
     * @param event Event name or PuppeteerEvents enum
     * @param listener Event listener function
     */
    on: (event, listener) => {
        return eventEmitter.on(event, listener);
    },
    /**
     * Register a one-time event listener
     * @param event Event name or PuppeteerEvents enum
     * @param listener Event listener function
     */
    once: (event, listener) => {
        return eventEmitter.once(event, listener);
    },
    /**
     * Remove an event listener
     * @param event Event name or PuppeteerEvents enum
     * @param listener Event listener to remove
     */
    off: (event, listener) => {
        return eventEmitter.off(event, listener);
    },
    /**
     * Remove all listeners for an event
     * @param event Event name or PuppeteerEvents enum (if omitted, all events are cleared)
     */
    removeAllListeners: (event) => {
        return eventEmitter.removeAllListeners(event);
    },
    /**
     * Emit an event synchronously
     * @param event Event name or PuppeteerEvents enum
     * @param args Arguments to pass to listeners
     */
    emit: (event, ...args) => {
        return eventEmitter.emit(event, ...args);
    },
    /**
     * Emit an event asynchronously and wait for all listeners to complete
     * @param event Event name or PuppeteerEvents enum
     * @param args Arguments to pass to listeners
     */
    emitAsync: async (event, ...args) => {
        return eventEmitter.emitAsync(event, ...args);
    },
    /**
     * Get the number of listeners for an event
     * @param event Event name or PuppeteerEvents enum
     */
    listenerCount: (event) => {
        return eventEmitter.listenerCount(event);
    },
    /**
     * Get all registered events
     */
    eventNames: () => {
        return eventEmitter.eventNames();
    },
    /**
     * Set the maximum number of listeners per event
     * @param n Maximum number of listeners
     */
    setMaxListeners: (n) => {
        return eventEmitter.setMaxListeners(n);
    },
    /**
     * Get the maximum number of listeners per event
     */
    getMaxListeners: () => {
        return eventEmitter.getMaxListeners();
    },
};
//# sourceMappingURL=puppeteer-events.js.map