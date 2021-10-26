/**
 * Gulp test tasks.
 */

'use strict';

const { task, parallel, src } = require('gulp');
const path = require('path'),
  conf = require('./conf'),
  $ = require('gulp-load-plugins')(),
  remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');


/**
 * Gulp pre coverage test with mocha and istanbul configuration.
 */
task('pre-test', async function(done) {
  parallel('coverage-build', done);
  return src(path.join(conf.paths.src, conf.path_pattern.js))
    .pipe($.istanbul({
      includeUntested: true
    }))
    .pipe($.istanbul.hookRequire());
});

const runTest = async function(reporters, done) {
  let mochaError;

  src(path.join(conf.paths.test, conf.path_pattern.js))
    .pipe($.plumber())
    .pipe($.mocha({
      reporter: 'spec'
    }))
    .on('error', function (error) {
      mochaError = error;
    })
    .pipe($.istanbul.writeReports({
      dir: conf.paths.coverage,
      reporters: reporters,
      reportOpts: {
        dir: conf.paths.coverage
      }
    }))
    .on('end', function () {
      done(mochaError);
    });
};

/**
 * Gulp coverage test with mocha and istanbul configuration.
 * @param done - done callback function.
 */
task('coverage-test', async function(done) {
  parallel('pre-test', done);
  runTest(['json', 'text', 'text-summary'], done);
});

/**
 * Gulp summary test with mocha and istanbul configuration.
 * @param done - done callback function.
 */
task('summary-test', async function(done) {
  parallel('pre-test', done);
  runTest(['text', 'text-summary'], done);
});

/**
 * Gulp coverage task.
 * Cleans temporary created files in sources -> cleans coverage folder -> run coverage test -> remap istanbul support -> clean temporary generated files.
 * @param done - done callback function.
 */
task('coverage', async function(done) {
  parallel('coverage-test', 'remap-istanbul', done);
});

/**
 * Gulp test task.
 * Cleans temporary created files in sources -> run summary test -> clean temporary generated files.
 * @param done - done callback function.
 */
task('test', async function(done) {
  parallel('clean-source-tmp', 'summary-test', 'clean-source-tmp', done);
});

/**
 * Gulp coverage build task.
 * clean tmp -> tmp scripts
 */
task('coverage-build', async function(done){
  parallel('clean-source-tmp','tmp-scripts', done);
});

/**
 * Gulp remap istanbul task.
 * RemapIstanbul will access the coverage-final.json and generate reports.
 * Report errors.
 */
task('remap-istanbul', async function () {
  return src(path.join(conf.paths.coverage, 'coverage-final.json'))
    .pipe(remapIstanbul({
      reports: {
        'html': path.join(conf.paths.coverage, conf.paths.reportDir),
        fail: true
      }
    }))
    .on('error', conf.errorHandler(conf.errors.title.TYPESCRIPT));
});
