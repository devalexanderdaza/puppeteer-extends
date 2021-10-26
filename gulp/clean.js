/**
 * Gulp clean tasks.
 */

'use strict';

const { task, parallel, src, dest } = require('gulp');
const path = require('path'),
  del = require('del'),
  conf = require('./conf');
const gulp = require("gulp");
const bump = require("gulp-bump");
const git = require("gulp-git");
const filter = require("gulp-filter");
const tag_version = require("gulp-tag-version");

async function clean(dir, done) {
  del(dir);
  done();
}

/**
 * Gulp clean lib directory task.
 */
task('clean-lib', async function (done) {
  return del([
    conf.paths.lib
  ]);
});

/**
 * Gulp clean coverage directory task.
 */
task('clean-coverage', async function (done) {
  return del([
    conf.paths.coverage
  ]);
});

/**
 * Gulp clean documentation directory task.
 */
task('clean-doc', async function (done) {
  return del([
    conf.paths.docs
  ]);
});

/**
 * Gulp task to clean temporary .js files which are created inside src folder.
 */
task('clean-source-tmp', async function (done) {
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
task('clean-js-tmp', async function (done) {
  return del([
    conf.paths.jsTmp
  ]);
});

/**
 * Gulp task to clean .jsTmp directory.
 * Run clean-js-tmp task.
 * @param done - done callback function.
 */
task('clean-tmp', async function (done) {
  parallel('clean-js-tmp', done);
});

/**
 * Gulp task to clean lib directory.
 * Run clean-lib task.
 * @param done - done callback function.
 */
task('clean-build', async function (done) {
  parallel('clean-lib', done);
});

