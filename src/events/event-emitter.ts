/**
 * @since 1.7.0
 */
import { Logger } from "../utils/logger";

export type EventListener = (...args: any[]) => void | Promise<void>;

/**
 * Event emitter for puppeteer-extends
 * Supports synchronous and asynchronous event handling
 */
export class EventEmitter {
  private events: Map<string, EventListener[]> = new Map();
  private maxListeners: number = 10;
  
  /**
   * Register an event listener
   * @param event Event name
   * @param listener Event listener function
   */
  public on(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listeners = this.events.get(event)!;
    
    if (listeners.length >= this.maxListeners) {
      Logger.warn(`EventEmitter: Possible memory leak detected. ${listeners.length} listeners added to event '${event}'`);
    }
    
    listeners.push(listener);
    return this;
  }
  
  /**
   * Register a one-time event listener
   * @param event Event name
   * @param listener Event listener function
   */
  public once(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
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
  public off(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      return this;
    }
    
    const listeners = this.events.get(event)!;
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
  public removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    
    return this;
  }
  
  /**
   * Emit an event synchronously
   * @param event Event name
   * @param args Arguments to pass to listeners
   */
  public emit(event: string, ...args: any[]): boolean {
    if (!this.events.has(event)) {
      return false;
    }
    
    const listeners = this.events.get(event)!;
    
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        Logger.error(`Error in event listener for '${event}'`, error instanceof Error ? error : String(error));
      }
    }
    
    return true;
  }
  
  /**
   * Emit an event asynchronously and wait for all listeners to complete
   * @param event Event name
   * @param args Arguments to pass to listeners
   */
  public async emitAsync(event: string, ...args: any[]): Promise<boolean> {
    if (!this.events.has(event)) {
      return false;
    }
    
    const listeners = this.events.get(event)!;
    const promises: Promise<void>[] = [];
    
    for (const listener of listeners) {
      try {
        const result = listener(...args);
        
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        Logger.error(`Error in event listener for '${event}'`, error instanceof Error ? error : String(error));
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
  public listenerCount(event: string): number {
    return this.events.has(event) ? this.events.get(event)!.length : 0;
  }
  
  /**
   * Get all registered events
   */
  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }
  
  /**
   * Set the maximum number of listeners per event
   * @param n Maximum number of listeners
   */
  public setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }
  
  /**
   * Get the maximum number of listeners per event
   */
  public getMaxListeners(): number {
    return this.maxListeners;
  }
}