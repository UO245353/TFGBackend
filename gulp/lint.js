'use strict';

const gulp = require('gulp');
const paths = require('./paths');

const $ = require('gulp-load-plugins')({
	camelize: true
});

// JSHint task
gulp.task('lint', () => {
  return gulp.src(paths.srcLint)
  .pipe($.jshint())
  .pipe($.jshint.reporter('default'))
	.on('error', err => {
		$.util.beep();
		console.log(err);
	});
});
