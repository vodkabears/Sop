var gulp = require('gulp');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');

/**
 * @const
 * @type {Array}
 */
var JS_SRC = ['*.js', '!node_modules/**'];

/**
 * @const
 * @type {Array}
 */
var TEST_SRC = ['test/*.js'];

gulp.task('jshint', function() {
  gulp.src(JS_SRC)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', function() {
  gulp.src(JS_SRC)
    .pipe(jscs());
});

gulp.task('mocha', function() {
  return gulp.src(TEST_SRC, {read: false})
    .pipe(mocha());
});

gulp.task('lint', ['jshint', 'jscs']);
gulp.task('test', ['lint', 'mocha']);
gulp.task('default', ['test']);
