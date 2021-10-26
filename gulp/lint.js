/**
 * Gulp common lint tasks.
 */

'use strict';

const { task, parallel, src } = require('gulp');
const path = require('path'),
    conf = require('./conf'),
    stylish = require('jshint-stylish'),
    $ = require('gulp-load-plugins')();

/**
 * Gulp tslint task.
 * Run TSLint and report errors.
 * Report errors on pipe process.
 */
task('tslint', async function () {
    return src(conf.tsFilesGlob)
        .pipe($.tslint())
        .pipe($.tslint.report(conf.reports.tslint_report_type, {
            emitError: false
        }))
        .on('error', conf.errorHandler(conf.errors.title.TYPESCRIPT));
});

/**
 * Gulp jshint task.
 * Run JShint.
 * Use jshint stylish to show errors.
 */
task('jshint', async function () {
  return src([path.join(conf.paths.gulp, conf.path_pattern.js), conf.paths.gulpFile])
    .pipe($.jshint())
    .pipe($.jshint.reporter(stylish));
});
