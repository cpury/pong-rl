const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const terser = require('gulp-terser');

// Move html files over
gulp.task('html', function() {
  return gulp
    .src(['src/html/**/*.html'])
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return gulp
    .src(['src/scss/style.scss'])
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

// Compile and move the javascript files into our /src/js folder.
// Prod version: Transpile and minimize JS
gulp.task('js-prod', function() {
  return gulp
    .src(['src/js/**/*.js'])
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      }),
    )
    .pipe(terser())
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
});

// Compile and move the javascript files into our /src/js folder.
// Dev version: Don't transpile / minimize JS
gulp.task('js-dev', function() {
  return gulp
    .src(['src/js/**/*.js'])
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
});

// Copy over vendor js files
gulp.task('vendor-js', function() {
  return gulp
    .src([
      'node_modules/babel-polyfill/dist/polyfill.js',
      'node_modules/@tensorflow/tfjs/dist/tf.min.js',
    ])
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
});

// Move all assets over
gulp.task('assets', function() {
  return gulp
    .src(['src/assets/**/*'])
    .pipe(gulp.dest('dist/assets'))
    .pipe(browserSync.stream());
});

// Move all public files over (directly into dist)
gulp.task('public', function() {
  return gulp
    .src(['src/public/**/*'])
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

gulp.task('watch', function() {
  gulp.watch(['src/scss/*'], ['sass']);
  gulp.watch(['src/js/*'], ['js-dev']);
  gulp.watch(['src/assets/**/*'], ['assets']);
  gulp.watch(['src/html/**/*'], ['html']);
  gulp.watch(['src/public/**/*'], ['public']);
});

// Static Server + watching scss/html files
gulp.task(
  'serve',
  ['html', 'sass', 'vendor-js', 'js-dev', 'assets', 'public', 'watch'],
  function() {
    browserSync.init({
      server: './dist',
    });

    gulp.watch(['html', 'sass', 'vendor-js', 'js-dev', 'assets', 'public', 'hbs']);
    gulp.watch('src/*').on('change', browserSync.reload);
  },
);

gulp.task('default', ['serve']);
gulp.task('build', ['html', 'sass', 'vendor-js', 'js-prod', 'assets', 'public']);
