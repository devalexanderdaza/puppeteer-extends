/**
 * @since 2.0.0
 */
import { FolderLogger, ILogOption } from 'folder-logger';
import path from 'path';

/**
 * Default path for logs
 */
const DEFAULT_LOG_PATH = path.join(process.cwd(), 'logs');

/**
 * Logger service with file-based logging
 */
export class Logger {
  private static instance: FolderLogger;
  
  /**
   * Get or create the logger instance
   * @private
   */
  private static getInstance(): FolderLogger {
    if (!this.instance) {
      this.instance = new FolderLogger(DEFAULT_LOG_PATH);
    }
    return this.instance;
  }
  
  /**
   * Configure logger with custom path
   * @param logPath Custom path for log files
   */
  public static configure(logPath: string): void {
    this.instance = new FolderLogger(logPath);
  }
  
  /**
   * Log debug message
   * @param message Message to log
   * @param context Optional context data
   */
  public static debug(message: string, context?: ILogOption): void {
    this.getInstance().debug(message, context);
  }
  
  /**
   * Log info message
   * @param message Message to log
   * @param context Optional context data
   */
  public static info(message: string, context?: ILogOption): void {
    this.getInstance().info(message, context);
  }
  
  /**
   * Log warning message
   * @param message Message to log
   * @param context Optional context data
   */
  public static warn(message: string, context?: ILogOption): void {
    this.getInstance().warn(message, context);
  }
  
  /**
   * Log error message
   * @param message Message to log
   * @param error Error object or string
   * @param context Optional context data
   */
  public static error(message: string, error?: Error | string, context?: ILogOption): void {
    if (error instanceof Error) {
      message = `${message} - ${error.message}`;
    } else if (typeof error === 'string') {
      message = `${message} - ${error}`;
    } else {
      context = error;
    }
    this.getInstance().error(message, context);
  }
}