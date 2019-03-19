'use strict';

const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const paths = require('./paths');

let nd_app;

gulp.task('start', () => {
	if (nd_app) {
		try {
			nd_app.stop();
		} catch(e) {}
	}
	
	nd_app = nodemon({
		script: paths.srcServerStart,
		ext: 'js',
		env: {NODE_PATH: 'server/'},
		ignore: paths.ignoredSrc
	}).on('restart', () => {
		console.log('Server restarts');
	});
});

gulp.task('restart', function() {
	return nd_app.restart();
});
