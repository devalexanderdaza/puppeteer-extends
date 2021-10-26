/**
 * Gulp source watch tasks.
 */

'use strict';

const gulp = require('gulp');
const { task, parallel, src, dest, watch, } = require('gulp');
const path = require('path'),
  conf = require('./conf');

/**
 * Gulp source watch task.
 * Clean js tmp -> run tslint, jshint -> temporary watch scripts -> run watch scripts, watch build scripts in parallel.
 * @param done - done callback function.
 */
task('watch', async function (done) {
  parallel('watch-scripts', 'watch-build-scripts', done);
});

/**
 * Gulp watch scripts.
 * Watch source script changes -> run tslint -> watch .tmp source changes.
 */
task('watch-scripts', async function (done) {
  watch([
    path.join(conf.paths.test, conf.path_pattern.ts),
    path.join(conf.paths.src, conf.path_pattern.ts)
  ], function () {
    parallel('tslint', 'tmp-watch-scripts', done);
  });
});

/**
 * Gulp watch build scripts.
 * Watch changes in build process helper files -> run jshint.
 */
task('watch-build-scripts', async function () {
  watch([
    path.join(conf.paths.gulp, conf.path_pattern.js), conf.paths.gulpFile], function () {
    gulp.start('jshint');
  });
});







