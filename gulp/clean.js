/**
 * Gulp clean tasks.
 */

'use strict';

var path = require('path'),
    gulp = require('gulp-help')(require('gulp')),
    del = require('del'),
    runSequence = require('run-sequence'),
    conf = require('./conf');

/**
 * Gulp clean lib directory task.
 */
gulp.task('clean-lib', function () {
    return del([
        conf.paths.lib
    ]);
});

/**
 * Gulp clean coverage directory task.
 */
gulp.task('clean-coverage', function () {
    return del([
        conf.paths.coverage
    ]);
});

/**
 * Gulp clean documentation directory task.
 */
gulp.task('clean-doc', function () {
    return del([
        conf.paths.docs
    ]);
});

/**
 * Gulp task to clean temporary .js files which are created inside src folder.
 */
gulp.task('clean-source-tmp', function () {
    return del([
      path.join(conf.paths.src, conf.path_pattern.js),
      path.join(conf.paths.src, conf.path_pattern.map),
      path.join(conf.paths.src, conf.path_pattern.ktp_ts),
      path.join(conf.paths.test, conf.path_pattern.js),
      path.join(conf.paths.test, conf.path_pattern.map),
      path.join(conf.paths.test, conf.path_pattern.ktp_ts)
    ]);
});

/**
 * Gulp task to clean temporary .js files which are created inside .jsTmp folder.
 */
gulp.task('clean-js-tmp', function () {
    return del([
        conf.paths.jsTmp
    ]);
});

/**
 * Gulp task to clean .jsTmp directory.
 * Run clean-js-tmp task.
 * @param done - done callback function.
 */
gulp.task('clean-tmp', function(done){
  runSequence('clean-js-tmp',done);
});

/**
 * Gulp task to clean lib directory.
 * Run clean-lib task.
 * @param done - done callback function.
 */
gulp.task('clean-build', function(done){
    runSequence('clean-lib',done);
});

