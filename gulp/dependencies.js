'use strict';

const gulp = require('gulp');
const paths = require('./paths');

const $ = require('gulp-load-plugins')({
	camelize: true
});

// install npm and gulp packages
gulp.task('dependencies', () => {
  return gulp.src(paths.dependencies)
	.pipe($.install());
});
