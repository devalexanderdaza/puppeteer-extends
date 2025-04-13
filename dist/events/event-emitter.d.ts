export type EventListener = (...args: any[]) => void | Promise<void>;
/**
 * Event emitter for puppeteer-extends
 * Supports synchronous and asynchronous event handling
 */
export declare class EventEmitter {
    private events;
    private maxListeners;
    /**
     * Register an event listener
     * @param event Event name
     * @param listener Event listener function
     */
    on(event: string, listener: EventListener): this;
    /**
     * Register a one-time event listener
     * @param event Event name
     * @param listener Event listener function
     */
    once(event: string, listener: EventListener): this;
    /**
     * Remove an event listener
     * @param event Event name
     * @param listener Event listener to remove
     */
    off(event: string, listener: EventListener): this;
    /**
     * Remove all listeners for an event
     * @param event Event name (if omitted, all events are cleared)
     */
    removeAllListeners(event?: string): this;
    /**
     * Emit an event synchronously
     * @param event Event name
     * @param args Arguments to pass to listeners
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * Emit an event asynchronously and wait for all listeners to complete
     * @param event Event name
     * @param args Arguments to pass to listeners
     */
    emitAsync(event: string, ...args: any[]): Promise<boolean>;
    /**
     * Get the number of listeners for an event
     * @param event Event name
     */
    listenerCount(event: string): number;
    /**
     * Get all registered events
     */
    eventNames(): string[];
    /**
     * Set the maximum number of listeners per event
     * @param n Maximum number of listeners
     */
    setMaxListeners(n: number): this;
    /**
     * Get the maximum number of listeners per event
     */
    getMaxListeners(): number;
}
