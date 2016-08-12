'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var gulpNSP = require('gulp-nsp');

gulp.task('default', ['nsp', 'lint', 'mocha']);

gulp.task('test', ['default']);

gulp.task('mocha', function () {
  return gulp.src('./tests/**/*.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('lint', function() {
  return gulp.src(['./**/*.js', '!node_modules/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('nsp', function (cb) {
  gulpNSP({
    stopOnError: false, // We'll triage these notifications manually
    package: __dirname + '/package.json'
  }, cb);
});
