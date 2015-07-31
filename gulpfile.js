var gulp = require('gulp');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var source = require('vinyl-source-stream');
var istanbul = require('gulp-istanbul');
var browserify = require('browserify');

/**
 * @const
 * @type {Array}
 */
var LIB_SRC = ['index.js'];

/**
 * @const
 * @type {Array}
 */
var JS_SRC = ['*.js', 'test/*.js'];

/**
 * @const
 * @type {Array}
 */
var TEST_SRC = ['test/parse.js', 'test/stringify.js'];

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

gulp.task('browserify-unit', function() {
  return browserify({ entries: TEST_SRC })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('test/browser/'));
});

gulp.task('unit', ['browserify-unit'], function() {
  return gulp.src(LIB_SRC)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      gulp.src(TEST_SRC)
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 }}));
    });
});

gulp.task('lint', ['jshint', 'jscs']);
gulp.task('test', ['lint', 'unit']);
gulp.task('default', ['test']);
