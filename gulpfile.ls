require! <[gulp gulp-util express connect-livereload gulp-jade tiny-lr gulp-livereload path]>
require! <[gulp-if gulp-livescript gulp-less gulp-concat gulp-json-editor gulp-commonjs gulp-insert streamqueue gulp-uglify]>

gutil = gulp-util

app = express!
lr = tiny-lr!

build_path = '_public'
production = true if gutil.env.env is \production


gulp.task 'translations' ->
  require! <[fs]>

  fs.readdir './md', (,langs)->
    for lang in langs
      gulp.src 'app/partials/*.jade'
        .pipe gulp-jade do
          locals:
            lang: lang
        .pipe gulp.dest "#{build_path}/#{lang}"

gulp.task 'html', <[translations]>, ->
  gulp.src 'app/*.jade'
    .pipe gulp-jade!
    .pipe gulp.dest "#{build_path}"
    .pipe gulp-livereload lr

require! <[gulp-bower gulp-bower-files gulp-filter]>

gulp.task 'bower' ->
  gulp-bower!

gulp.task 'js:vendor' <[bower]> ->
  bower = gulp-bower-files!
    .pipe gulp-filter -> it.path is /\.js$/

  vendor = gulp.src 'vendor/scripts/*.js'

  s = streamqueue { +objectMode }
    .done bower, vendor
    .pipe gulp-concat 'vendor.js'
    .pipe gulp-if production, gulp-uglify!
    .pipe gulp.dest "#{build_path}/js"

gulp.task 'js:app', ->
  env = gulp.src 'app/**/*.jsenv'
    .pipe gulp-json-editor (json) ->
      for key of json when process.env[key]?
        json[key] = that
      json
    .pipe gulp-insert.prepend 'module.exports = '
    .pipe gulp-commonjs!

  app = gulp.src 'app/**/*.ls'
    .pipe gulp-livescript({+bare}).on 'error', gutil.log

  streamqueue { +objectMode }
    .done env, app
    .pipe gulp-concat 'app.js'
    .pipe gulp-if production, gulp-uglify!
    .pipe gulp.dest "#{build_path}/js"
    .pipe gulp-livereload lr

gulp.task 'css', ->
  compress = production
  gulp.src 'app/styles/app.less'
    .pipe gulp-less compress: compress
    .pipe gulp.dest "#{build_path}/css"
    .pipe gulp-livereload lr

gulp.task 'assets', ->
  gulp.src 'app/assets/**/*'
    .pipe gulp.dest "#{build_path}"
    .pipe gulp-livereload lr

gulp.task 'server', ->
  app.use connect-livereload!
  app.use express.static path.resolve "#build_path"
  app.all '/**', (req, res, next) ->
    res.sendfile __dirname + "/#{build_path}/index.html"
  app.listen 3000
  gulp-util.log 'Listening on port 3000'

gulp.task 'watch', ->
  lr.listen 35729, ->
    return gulp-util.log it if it
  gulp.watch [
    'app/**/*.jade',
    'md/**/*.md'
  ], <[html]>
  gulp.watch 'app/**/*.less', <[css]>
  gulp.watch 'app/**/*.ls', <[js:app]>

gulp.task 'build', <[html js:vendor js:app assets css]>
gulp.task 'dev', <[build server watch]>
gulp.task 'default', <[build]>
