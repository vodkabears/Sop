var pkg = require('./package.json');
var gulp = require('gulp');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var source = require('vinyl-source-stream');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var browserify = require('browserify');

/**
 * @const
 * @type {String}
 */
var BANNER = [
  '/*',
  ' *  <%= pkg.name[0].toUpperCase() + pkg.name.slice(1) %> - v<%= pkg.version %>',
  ' *  <%= pkg.description %>',
  ' *  <%= pkg.homepage %>',
  ' *',
  ' *  Made by <%= pkg.author.name %>',
  ' *  Under <%= pkg.license %> License',
  ' */',
  ''
].join('\n');

/**
 * @const
 * @type {String}
 */
var BROWSER_DIST = 'browser/';

/**
 * @const
 * @type {String}
 */
var BROWSER_TESTS_DIST = 'test/browser';

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
    .pipe(jshint.reporter('fail'))
    .on('error', function() {
      console.error('JSHint failed');
      process.exit(1);
    });
});

gulp.task('jscs', function() {
  gulp.src(JS_SRC)
    .pipe(jscs())
    .on('error', function(err) {
      console.error(err.toString());
      console.error('JSCS failed');
      process.exit(1);
    });
});

gulp.task('browserify-unit', function() {
  return browserify({ entries: TEST_SRC })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(BROWSER_TESTS_DIST));
});

gulp.task('unit', function() {
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

gulp.task('coveralls', function() {
  gulp.src('coverage/lcov.info')
    .pipe(coveralls());
});

gulp.task('browserify', function() {
  var name = pkg.name;

  return browserify({
      entries: LIB_SRC,
      standalone: name[0].toUpperCase() + name.slice(1)
    })
    .bundle()
    .pipe(source(name + '.js'))
    .pipe(header(BANNER, { pkg: pkg }))
    .pipe(gulp.dest(BROWSER_DIST));
});

gulp.task('compress', ['browserify'], function() {
  var name = pkg.name;

  return gulp.src(BROWSER_DIST + name + '.js')
    .pipe(uglify())
    .pipe(rename(name + '.min.js'))
    .pipe(header(BANNER, { pkg: pkg }))
    .pipe(gulp.dest(BROWSER_DIST));
});

gulp.task('lint', ['jshint', 'jscs']);
gulp.task('test', ['lint', 'unit', 'browserify-unit']);
gulp.task('build', ['browserify', 'compress']);
gulp.task('default', ['test', 'build']);
