/**
 * Browser configuration options
 * @since 1.6.0
 */
export interface BrowserOptions {
    /**
     * Launch browser in headless mode
     * @default true
     */
    isHeadless?: boolean;
    /**
     * Enable debug logging
     * @default false
     */
    isDebug?: boolean;
    /**
     * Custom browser launch arguments
     */
    customArguments?: string[];
    /**
     * Path to user data directory
     */
    userDataDir?: string;
    /**
     * Browser instance identifier
     * @default "default"
     */
    instanceId?: string;
}
/**
 * Default browser arguments
 */
export declare const DEFAULT_BROWSER_ARGS: string[];
