"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
/**
 * @since 1.7.0
 */
const logger_1 = require("../utils/logger");
/**
 * Event emitter for puppeteer-extends
 * Supports synchronous and asynchronous event handling
 */
class EventEmitter {
    constructor() {
        this.events = new Map();
        this.maxListeners = 10;
    }
    /**
     * Register an event listener
     * @param event Event name
     * @param listener Event listener function
     */
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        const listeners = this.events.get(event);
        if (listeners.length >= this.maxListeners) {
            logger_1.Logger.warn(`EventEmitter: Possible memory leak detected. ${listeners.length} listeners added to event '${event}'`);
        }
        listeners.push(listener);
        return this;
    }
    /**
     * Register a one-time event listener
     * @param event Event name
     * @param listener Event listener function
     */
    once(event, listener) {
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            return listener(...args);
        };
        this.on(event, onceWrapper);
        return this;
    }
    /**
     * Remove an event listener
     * @param event Event name
     * @param listener Event listener to remove
     */
    off(event, listener) {
        if (!this.events.has(event)) {
            return this;
        }
        const listeners = this.events.get(event);
        const index = listeners.indexOf(listener);
        if (index !== -1) {
            listeners.splice(index, 1);
            if (listeners.length === 0) {
                this.events.delete(event);
            }
        }
        return this;
    }
    /**
     * Remove all listeners for an event
     * @param event Event name (if omitted, all events are cleared)
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        }
        else {
            this.events.clear();
        }
        return this;
    }
    /**
     * Emit an event synchronously
     * @param event Event name
     * @param args Arguments to pass to listeners
     */
    emit(event, ...args) {
        if (!this.events.has(event)) {
            return false;
        }
        const listeners = this.events.get(event);
        for (const listener of listeners) {
            try {
                listener(...args);
            }
            catch (error) {
                logger_1.Logger.error(`Error in event listener for '${event}'`, error instanceof Error ? error : String(error));
            }
        }
        return true;
    }
    /**
     * Emit an event asynchronously and wait for all listeners to complete
     * @param event Event name
     * @param args Arguments to pass to listeners
     */
    async emitAsync(event, ...args) {
        if (!this.events.has(event)) {
            return false;
        }
        const listeners = this.events.get(event);
        const promises = [];
        for (const listener of listeners) {
            try {
                const result = listener(...args);
                if (result instanceof Promise) {
                    promises.push(result);
                }
            }
            catch (error) {
                logger_1.Logger.error(`Error in event listener for '${event}'`, error instanceof Error ? error : String(error));
            }
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
        return true;
    }
    /**
     * Get the number of listeners for an event
     * @param event Event name
     */
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }
    /**
     * Get all registered events
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
    /**
     * Set the maximum number of listeners per event
     * @param n Maximum number of listeners
     */
    setMaxListeners(n) {
        this.maxListeners = n;
        return this;
    }
    /**
     * Get the maximum number of listeners per event
     */
    getMaxListeners() {
        return this.maxListeners;
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=event-emitter.js.map