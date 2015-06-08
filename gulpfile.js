var gulp = require('gulp'),
	concat  = require('gulp-concat'),
	uglify 	  = require('gulp-uglify'),
	cssmin    = require('gulp-cssmin');

// JS Concat
gulp.task('js', function() {
  return gulp.src('./src/js/*.js')
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./build/js/'));
});

// CSS Concat
gulp.task('css', function () {
  return gulp.src('./src/css/*.css')
    .pipe(concat("css/bundle.css"))
    .pipe(gulp.dest('build/'));
});

// JS Uglify
gulp.task('uglify', function() {
  gulp.src('src/js/*.js')
    .pipe(uglify())
    .pipe(concat('bundle.min.js'))
    .pipe(gulp.dest('./build/js/'));
});

// CSS Minify
gulp.task('minify', function() {
  gulp.src('src/css/*.css')
    .pipe(cssmin())
    .pipe(concat('bundle.min.css'))
    .pipe(gulp.dest('./build/css/'));
});

// Define Global and Default Task
gulp.task('concat', ['js', 'css']);
gulp.task('compress', ['uglify', 'minify']);
gulp.task('default', ['concat', 'compress']);