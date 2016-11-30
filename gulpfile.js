var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  merge = require('merge-stream');

gulp.task('js', function() {
  var js = gulp.src('src/**/*.js');
  var html = gulp.src('src/**/!(index)*.html')
    .pipe($.angularTemplatecache({standalone: true}));

  return merge(js, html)
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'))
    .pipe($.concat('app.js'))
    .pipe($.ngAnnotate())
    .pipe(gulp.dest('dist'))
    .pipe($.connect.reload());
});

gulp.task('lib', function() {
  return gulp.src([
      'bower_components/angular-bootstrap/ui-bootstrap.min.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'bower_components/n3/n3-browser.js'])
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('css', function() {
  return gulp.src('src/**/*.css')
    .pipe($.concat('app.css'))
    .pipe(gulp.dest('dist'))
    .pipe($.connect.reload());
});

gulp.task('resources', function() {
  return gulp.src('resources/**')
    .pipe(gulp.dest('dist'))
    .pipe($.connect.reload());
});

gulp.task('index', ['js', 'lib', 'css'], function() {
  var res = gulp.src([
    'dist/lib/ui-bootstrap.min.js',
    'dist/lib/ui-bootstrap-tpls.min.js',
    'dist/lib/n3-browser.js',
    'dist/*.js',
    'dist/*.css'], {read: false});

  return gulp.src('src/index.html')
    .pipe($.inject(res, {addRootSlash: false, ignorePath: 'dist'}))
    .pipe(gulp.dest('dist'))
    .pipe($.connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['js']);
  gulp.watch('src/**/!(index)*.html', ['js']);
  gulp.watch('src/**/*.css', ['css']);
  gulp.watch('src/index.html', ['index']);
  gulp.watch('resources/**', ['resources']);
});

gulp.task('connect', function() {
  return $.connect.server({
    port: 9000,
    root: 'dist',
    livereload: true
  });
});

gulp.task('dist', ['index', 'resources']);

gulp.task('default', ['dist', 'watch', 'connect']);