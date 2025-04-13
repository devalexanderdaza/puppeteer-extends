/**
 * @since 1.7.0
 */
import { Browser, Page } from "puppeteer";
import { EventEmitter } from "./event-emitter";
import { NavigationOptions } from "../navigation/navigation-service";

// Singleton event emitter instance
const eventEmitter = new EventEmitter();

// Standard events emitted by puppeteer-extends
export enum PuppeteerEvents {
  // Browser events
  BROWSER_CREATED = "browser:created",
  BROWSER_CLOSED = "browser:closed",
  
  // Page events
  PAGE_CREATED = "page:created",
  PAGE_CLOSED = "page:closed",
  
  // Navigation events
  NAVIGATION_STARTED = "navigation:started",
  NAVIGATION_SUCCEEDED = "navigation:succeeded",
  NAVIGATION_FAILED = "navigation:failed",
  
  // Error events
  ERROR = "error",
  NAVIGATION_ERROR = "navigation:error",
  BROWSER_ERROR = "browser:error",
  PAGE_ERROR = "page:error",
  
  // Session events
  SESSION_APPLIED = "session:applied",
  SESSION_EXTRACTED = "session:extracted",
  SESSION_CLEARED = "session:cleared",
  
  // Plugin events
  PLUGIN_REGISTERED = "plugin:registered",
  PLUGIN_UNREGISTERED = "plugin:unregistered"
}

// Event parameter types
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

// Export the singleton instance
export const Events = {
  /**
   * Register an event listener
   * @param event Event name or PuppeteerEvents enum
   * @param listener Event listener function
   */
  on: (event: string | PuppeteerEvents, listener: (...args: any[]) => void) => {
    return eventEmitter.on(event, listener);
  },
  
  /**
   * Register a one-time event listener
   * @param event Event name or PuppeteerEvents enum
   * @param listener Event listener function
   */
  once: (event: string | PuppeteerEvents, listener: (...args: any[]) => void) => {
    return eventEmitter.once(event, listener);
  },
  
  /**
   * Remove an event listener
   * @param event Event name or PuppeteerEvents enum
   * @param listener Event listener to remove
   */
  off: (event: string | PuppeteerEvents, listener: (...args: any[]) => void) => {
    return eventEmitter.off(event, listener);
  },
  
  /**
   * Remove all listeners for an event
   * @param event Event name or PuppeteerEvents enum (if omitted, all events are cleared)
   */
  removeAllListeners: (event?: string | PuppeteerEvents) => {
    return eventEmitter.removeAllListeners(event);
  },
  
  /**
   * Emit an event synchronously
   * @param event Event name or PuppeteerEvents enum
   * @param args Arguments to pass to listeners
   */
  emit: (event: string | PuppeteerEvents, ...args: any[]) => {
    return eventEmitter.emit(event, ...args);
  },
  
  /**
   * Emit an event asynchronously and wait for all listeners to complete
   * @param event Event name or PuppeteerEvents enum
   * @param args Arguments to pass to listeners
   */
  emitAsync: async (event: string | PuppeteerEvents, ...args: any[]) => {
    return eventEmitter.emitAsync(event, ...args);
  },
  
  /**
   * Get the number of listeners for an event
   * @param event Event name or PuppeteerEvents enum
   */
  listenerCount: (event: string | PuppeteerEvents) => {
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
  setMaxListeners: (n: number) => {
    return eventEmitter.setMaxListeners(n);
  },
  
  /**
   * Get the maximum number of listeners per event
   */
  getMaxListeners: () => {
    return eventEmitter.getMaxListeners();
  }
};

// Export the enum for type-safe event names
export { PuppeteerEvents as EventTypes };