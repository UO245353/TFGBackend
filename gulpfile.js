'use strict';

require('app-module-path').addPath(__dirname + '/server/');
const gulp = require('gulp');

const $ = require('gulp-load-plugins')({
	camelize: true
});

require('require-dir-lite')('./gulp');

gulp.task('default', function (cb) {
	// TODO: add the test
	$.sequence('dependencies', 'pot', 'lint', cb);
});
