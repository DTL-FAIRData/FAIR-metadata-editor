var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  merge = require('merge-stream');

gulp.task('js', function() {
  var js = gulp.src('app/**/*.js');
  var html = gulp.src('app/**/!(index)*.html')
    .pipe($.angularTemplatecache({standalone: true}));

  return merge(js, html)
    .pipe($.concat('app.js'))
    .pipe($.ngAnnotate())
    .pipe($.insert.wrap('(function(){"use strict";', '})();'))
    .pipe(gulp.dest('build'))
    .pipe($.connect.reload());
});

gulp.task('index', ['js', 'vendor'], function() {
  return gulp.src('app/index.html')
    .pipe($.inject(
      gulp.src(['build/vendor.*', 'build/app.*'], {read: false}),
      {addRootSlash: false, ignorePath: 'build'}
    ))
    .pipe(gulp.dest('build'))
    .pipe($.connect.reload());
});

gulp.task('resources', function() {
  return gulp.src('app/resources/*')
    .pipe(gulp.dest('build'))
    .pipe($.connect.reload());
});

gulp.task('vendor', function() {
  var css = gulp.src('bower_components/**/*.min.css')
    .pipe($.using())
    .pipe($.concat('vendor.css'))
    .pipe(gulp.dest('build'));

  var fonts = gulp.src('bower_components/**/dist/fonts/*')
    .pipe($.using())
    .pipe($.flatten())
    .pipe(gulp.dest('build/fonts'));

  var js = gulp.src('bower.json')
    .pipe($.mainBowerFiles('**/*.js'))
    .pipe($.using())
    .pipe($.concat('vendor.js'))
    .pipe(gulp.dest('build'));

  return merge(js, css, fonts);
});

gulp.task('watch', function() {
  gulp.watch('app/**/*.js', ['js']);
  gulp.watch('app/resources/*', ['resources']);
  gulp.watch('app/**/!(index)*.html', ['js'])
  gulp.watch('app/index.html', ['index']);
});

gulp.task('connect', function() {
  return $.connect.server({
    port: 9000,
    root: 'build',
    livereload: true
  });
});

gulp.task('default', ['index', 'resources', 'watch', 'connect']);