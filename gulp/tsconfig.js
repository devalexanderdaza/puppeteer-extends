/**
 * Gulp tsconfig.json update.
 */

'use strict';

const { task, parallel, src } = require('gulp');
const conf = require('./conf'),
  tsconfig = require('gulp-tsconfig-files');

/**
 * Gulp tsconfig update task.
 * Update files section in tsconfig.json.
 * Report errors.
 */
task('tsconfig-update', async function () {
  src(conf.tsFilesGlob).pipe(tsconfig()).on('error', conf.errorHandler(conf.errors.title.TYPESCRIPT));
});




