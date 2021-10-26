"use strict";

const gulp = require('gulp');
const HubRegistry = require('gulp-hub');
const { task, parallel } = require("gulp");

const hub = new HubRegistry(['gulp/*.js']);

gulp.registry(hub);


