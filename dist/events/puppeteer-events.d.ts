/**
 * @since 1.7.0
 */
import { Browser, Page } from "puppeteer";
import { EventEmitter } from "./event-emitter";
import { NavigationOptions } from "../navigation/navigation-service";
export declare enum PuppeteerEvents {
    BROWSER_CREATED = "browser:created",
    BROWSER_CLOSED = "browser:closed",
    PAGE_CREATED = "page:created",
    PAGE_CLOSED = "page:closed",
    NAVIGATION_STARTED = "navigation:started",
    NAVIGATION_SUCCEEDED = "navigation:succeeded",
    NAVIGATION_FAILED = "navigation:failed",
    ERROR = "error",
    NAVIGATION_ERROR = "navigation:error",
    BROWSER_ERROR = "browser:error",
    PAGE_ERROR = "page:error",
    SESSION_APPLIED = "session:applied",
    SESSION_EXTRACTED = "session:extracted",
    SESSION_CLEARED = "session:cleared",
    PLUGIN_REGISTERED = "plugin:registered",
    PLUGIN_UNREGISTERED = "plugin:unregistered"
}
export interface BrowserEventParams {
    browser: Browser;
    instanceId: string;
    options?: any;
}
export interface PageEventParams {
    page: Page;
    browser: Browser;
    instanceId?: string;
}
export interface NavigationEventParams {
    page: Page;
    url: string;
    options?: NavigationOptions;
    error?: Error;
}
export interface ErrorEventParams {
    error: Error;
    context?: any;
    source: string;
}
export interface SessionEventParams {
    sessionName: string;
    page?: Page;
    browser?: Browser;
    cookies?: number;
    storageItems?: number;
}
export interface PluginEventParams {
    pluginName: string;
    options?: any;
}
export declare const Events: {
    /**
     * Register an event listener
     * @param event Event name or PuppeteerEvents enum
     * @param listener Event listener function
     */
    on: (event: string | PuppeteerEvents, listener: (...args: any[]) => void) => EventEmitter;
    /**
     * Register a one-time event listener
     * @param event Event name or PuppeteerEvents enum
     * @param listener Event listener function
     */
    once: (event: string | PuppeteerEvents, listener: (...args: any[]) => void) => EventEmitter;
    /**
     * Remove an event listener
     * @param event Event name or PuppeteerEvents enum
     * @param listener Event listener to remove
     */
    off: (event: string | PuppeteerEvents, listener: (...args: any[]) => void) => EventEmitter;
    /**
     * Remove all listeners for an event
     * @param event Event name or PuppeteerEvents enum (if omitted, all events are cleared)
     */
    removeAllListeners: (event?: string | PuppeteerEvents) => EventEmitter;
    /**
     * Emit an event synchronously
     * @param event Event name or PuppeteerEvents enum
     * @param args Arguments to pass to listeners
     */
    emit: (event: string | PuppeteerEvents, ...args: any[]) => boolean;
    /**
     * Emit an event asynchronously and wait for all listeners to complete
     * @param event Event name or PuppeteerEvents enum
     * @param args Arguments to pass to listeners
     */
    emitAsync: (event: string | PuppeteerEvents, ...args: any[]) => Promise<boolean>;
    /**
     * Get the number of listeners for an event
     * @param event Event name or PuppeteerEvents enum
     */
    listenerCount: (event: string | PuppeteerEvents) => number;
    /**
     * Get all registered events
     */
    eventNames: () => string[];
    /**
     * Set the maximum number of listeners per event
     * @param n Maximum number of listeners
     */
    setMaxListeners: (n: number) => EventEmitter;
    /**
     * Get the maximum number of listeners per event
     */
    getMaxListeners: () => number;
};
export { PuppeteerEvents as EventTypes };
