/**
 * Gulp script build tasks.
 */

'use strict';

const { task, parallel, src, dest } = require('gulp');
const path = require('path'),
  conf = require('./conf'),
  tsConf = require('./../tsconfig.json').compilerOptions,
  $ = require('gulp-load-plugins')();

/* Initialize TS Project */
const tsProject = $.typescript.createProject(conf.paths.tsconfig_json);

/* Concat all source, test and typings TS files  */
const tsFiles = [].concat(path.join(conf.paths.src, conf.path_pattern.ts), path.join(conf.paths.test, conf.path_pattern.ts), conf.paths.typings.browser);

/**
 * Gulp npm task.
 * Clean lib directory.
 * Typescript compiler will generate all .js files and d.ts references for the source files.
 * Report errors.
 */
task('npm', async function (done) {
  parallel('clean-lib', done);
});

/**
 * Gulp temporary scripts generation task for coverage.
 * Typescript compiler will generate all .js files and maps references for the source files.
 * Report errors.
 */
task('tmp-scripts', async function () {
  const res = src(tsFiles, {
    base: '.'
  })
    .pipe($.sourcemaps.init())
    .pipe($.typescript(tsProject))
    .on('error', conf.errorHandler(conf.errors.title.TYPESCRIPT));

  return res.js
    .pipe($.sourcemaps.write('.', {
      // Return relative source map root directories per file.
      includeContent: false,
      sourceRoot: function (file) {
        const sourceFile = path.join(file.cwd, file.sourceMap.file);
        return path.relative(path.dirname(sourceFile), file.cwd);
      }
    }))
    .pipe(dest('.'));
});

/**
 * Gulp watch temporary scripts task for error checking.
 * Typescript compiler will generate all .js files and maps references for the source files.
 * Report errors.
 */

task('tmp-watch-scripts', async function (done) {
  const res = src(tsFiles, {
    base: '.'
  })
    .pipe($.typescript(tsProject))
    .on('error', conf.errorHandler(conf.errors.title.TYPESCRIPT));
  parallel('clean-js-tmp', done);
  return res.js
    .pipe(dest(conf.paths.jsTmp));
});

/**
 * Gulp nsp scripts task.
 * Run node Security check.
 * @param done - done callback function.
 */
task('nsp', async function (done) {
  $.nsp({
    package: path.resolve('package.json')
  }, done);
});

/**
 * Gulp build scripts task.
 * Run nsp -> clean build -> show tslint errors and update tsconfig.json in parallel -> run npm.
 * @param done - done callback function.
 */
task('build-scripts', async function (done) {
  parallel('nsp', 'clean-build', ['tslint', 'tsconfig-update'], 'npm', done);
});
