"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/**
 * @since 2.0.0
 */
const folder_logger_1 = require("folder-logger");
const path_1 = __importDefault(require("path"));
/**
 * Default path for logs
 */
const DEFAULT_LOG_PATH = path_1.default.join(process.cwd(), "logs");
/**
 * Logger service with file-based logging
 */
class Logger {
    /**
     * Get or create the logger instance
     * @private
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new folder_logger_1.FolderLogger(DEFAULT_LOG_PATH);
        }
        return this.instance;
    }
    /**
     * Configure logger with custom path
     * @param logPath Custom path for log files
     */
    static configure(logPath) {
        this.instance = new folder_logger_1.FolderLogger(logPath);
    }
    /**
     * Log debug message
     * @param message Message to log
     * @param context Optional context data
     */
    static debug(message, context) {
        this.getInstance().debug(message, context);
    }
    /**
     * Log info message
     * @param message Message to log
     * @param context Optional context data
     */
    static info(message, context) {
        this.getInstance().info(message, context);
    }
    /**
     * Log warning message
     * @param message Message to log
     * @param context Optional context data
     */
    static warn(message, context) {
        this.getInstance().warn(message, context);
    }
    /**
     * Log error message
     * @param message Message to log
     * @param error Error object or string
     * @param context Optional context data
     */
    static error(message, error, context) {
        if (error instanceof Error) {
            message = `${message} - ${error.message}`;
        }
        else if (typeof error === "string") {
            message = `${message} - ${error}`;
        }
        else {
            context = error;
        }
        this.getInstance().error(message, context);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map