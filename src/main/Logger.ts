/**
 * @since 1.0.0
 */
import { FolderLogger } from 'folder-logger';

/**
 * * Folder location to store logs
 * @since 1.0.0
 */
const path = `${process.cwd()}/logs/`;

/**
 * @since 1.0.0
 */
export const Logger = new FolderLogger(path);
