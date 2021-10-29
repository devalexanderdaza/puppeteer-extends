"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/**
 * @since 1.0.0
 */
var folder_logger_1 = require("folder-logger");
var path = process.cwd() + "/logs/";
/**
 * Export library components
 *
 * @since 1.0.0
 */
exports.Logger = new folder_logger_1.FolderLogger(path);
//# sourceMappingURL=logger.js.map