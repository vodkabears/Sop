var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');

/**
 * @const
 * @type {Array}
 */
var JS_SRC = ['*.js', '!node_modules/**'];

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

gulp.task('lint', ['jshint', 'jscs']);
gulp.task('test', ['lint']);
gulp.task('default', ['test']);
