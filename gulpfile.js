var gulp      = require('gulp'),
    concat    = require('gulp-concat'),
    uglify 	  = require('gulp-uglify'),
    cssnano   = require('gulp-cssnano');

// JS Concat
gulp.task('js', function() {
  return gulp.src('./src/**/*.js')
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('./build/js/'));
});

// CSS Concat
gulp.task('css', function () {
  return gulp.src('./src/**/*.css')
  .pipe(concat("css/bundle.css"))
  .pipe(gulp.dest('build/'));
});

// JS Uglify
gulp.task('uglify', function() {
  gulp.src('src/**/*.js')
  .pipe(uglify())
  .pipe(concat('bundle.min.js'))
  .pipe(gulp.dest('./build/js/'));
});

// CSS Minify
gulp.task('minify', function() {
  gulp.src('src/**/*.css')
  .pipe(cssnano({autoprefixer: false}))
  .pipe(concat('bundle.min.css'))
  .pipe(gulp.dest('./build/css/'));
});

// Define Global and Default Task
gulp.task('concat', ['js', 'css']);
gulp.task('compress', ['uglify', 'minify']);
gulp.task('default', ['concat', 'compress']);