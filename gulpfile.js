var gulp = require('gulp')
  plugins = require('gulp-load-plugins')(),
  merge = require('merge-stream'),
  config = require('./config.json');

gulp.task('vendor', function() {
  var js = gulp.src('./bower.json')
    .pipe(plugins.mainBowerFiles())
    .pipe(plugins.filter('**/*.js'))
    .pipe(plugins.using())
    .pipe(plugins.concat(config.dist.js.vendor))
    .pipe(gulp.dest(config.dist.path));
  
  var css = gulp.src('./bower_components/**/*.min.css')
    .pipe(plugins.using())
    .pipe(plugins.concat(config.dist.css.vendor))
    .pipe(gulp.dest(config.dist.path));

  return merge(js, css);
});

gulp.task('js', function() {
  var html = gulp.src(config.src.html)
    .pipe(plugins.angularTemplatecache({standalone: true}));

  var js = gulp.src(config.src.js);

  return merge(js, html)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'))
    .pipe(plugins.concat(config.dist.js.app))
    .pipe(plugins.insert.wrap('(function(){"use strict";', '})();'))
    .pipe(plugins.ngAnnotate())
    .pipe(gulp.dest(config.dist.path))
    .pipe(plugins.connect.reload());
});

gulp.task('css', function() {
  return gulp.src(config.src.css)
    .pipe(plugins.concat(config.dist.css.app))
    .pipe(gulp.dest(config.dist.path))
    .pipe(plugins.connect.reload());
});

gulp.task('html', ['vendor', 'js'], function() {
  var dist = config.dist;
  var inject = [dist.js.vendor, dist.js.app, dist.css.vendor, dist.css.app].map(function(e) {
    return config.dist.path + e;
  });

  return gulp.src(config.src.index)
    .pipe(plugins.inject(
      gulp.src(inject, {read: false}), {
        addRootSlash: false, ignorePath: config.dist.path
      }))
    .pipe(gulp.dest(config.dist.path))
    .pipe(plugins.connect.reload());
});

gulp.task('connect', function() {
  return plugins.connect.server({
    root: [config.dist.path],
    port: config.port || 9000,
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch(config.src.js, ['js']);
  gulp.watch(config.src.html, ['js']);
  gulp.watch(config.src.css, ['css']);
  gulp.watch(config.src.index, ['html']);
});

gulp.task('dist', ['vendor', 'js', 'css', 'html']);

gulp.task('default', ['dist', 'connect', 'watch']);