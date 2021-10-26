'use strict';

const $ = require('gulp-load-plugins')();
const conf = require('./conf');
const { task, parallel, src } = require('gulp');
const gulp = require("gulp");

task("typings-install", function (done) {
  src(conf.paths.typings_json)
    .pipe($.typings())
    .on('error', conf.errorHandler(conf.errors.title.TYPESCRIPT))
    .on('end', function () {
      done();
    })
    .resume();
});

gulp.task('build', async function (done) {
  parallel('typings-install', done);
});
