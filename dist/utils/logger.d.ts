/**
 * @since 2.0.0
 */
import { ILogOption } from "folder-logger";
/**
 * Logger service with file-based logging
 */
export declare class Logger {
    private static instance;
    /**
     * Get or create the logger instance
     * @private
     */
    private static getInstance;
    /**
     * Configure logger with custom path
     * @param logPath Custom path for log files
     */
    static configure(logPath: string): void;
    /**
     * Log debug message
     * @param message Message to log
     * @param context Optional context data
     */
    static debug(message: string, context?: ILogOption): void;
    /**
     * Log info message
     * @param message Message to log
     * @param context Optional context data
     */
    static info(message: string, context?: ILogOption): void;
    /**
     * Log warning message
     * @param message Message to log
     * @param context Optional context data
     */
    static warn(message: string, context?: ILogOption): void;
    /**
     * Log error message
     * @param message Message to log
     * @param error Error object or string
     * @param context Optional context data
     */
    static error(message: string, error?: Error | string, context?: ILogOption): void;
}
