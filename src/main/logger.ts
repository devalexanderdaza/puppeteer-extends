/**
 * @since 1.0.0
 */
import { FolderLogger } from 'folder-logger';

const path = `${process.cwd()}/logs/`;

/**
 * Export library components
 *
 * @since 1.0.0
 */
export const Logger = new FolderLogger(path);
