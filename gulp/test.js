'use strict';
const gulp = require('gulp');
const paths = require('./paths');
const $ = require('gulp-load-plugins')({
	camelize: true
});

gulp.task('coverage', function() {
  return gulp.src(paths.srcTested)
  .pipe($.istanbul()) // Covering files
  .pipe($.istanbul.hookRequire()); // Force `require` to return covered files
});

gulp.task('reports', function() {
  return gulp.src(paths.testsSrc)
  .pipe($.mocha({reporter: 'spec'}))
  .pipe($.istanbul.writeReports()) // Creating the reports after tests runned
  .once('error', function () {
    process.exit(1);
  })
  .once('end', function () {
    process.exit();
  });
});

// Tests
gulp.task('test', function (cb) {
	$.env({
			vars: {
					NODE_ENV: 'test' 
			}
	});

  $.sequence('coverage', 'reports', cb);
});
