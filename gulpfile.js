'use strict';

var gulp           = require('gulp');
var del            = require('del');
var autoprefixer   = require('gulp-autoprefixer');
var cache          = require('gulp-cache');
var concat         = require('gulp-concat');
var imagemin       = require('gulp-imagemin');
var minifyHTML     = require('gulp-minify-html');
var size           = require('gulp-size');
var sourcemaps     = require('gulp-sourcemaps');
var stylus         = require('gulp-stylus');
var uglify         = require('gulp-uglify');
var mainBowerFiles = require('main-bower-files');

if (process.env.NODE_ENV != 'production') {
    var browserSync    = require('browser-sync').create();
    var jscs           = require('gulp-jscs');
    var jshint         = require('gulp-jshint');
    var stylint        = require('gulp-stylint');
}

// Удаляет все содержимое папки build и src/lib
gulp.task('clean', function() {
    return del.sync(['client/build/**', 'client/src/lib/**']);
});

// Очищает кэш файлов
gulp.task('clear', function(done) {
    return cache.clearAll(done);
});

// Конкатинирует и минифицирует JavaScript, создает sourseMap
gulp.task('scripts', function() {
    return gulp.src(['client/src/js/**/*.js', 'client/src/js/main.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify({
        preserveComments: 'some',
        outSourceMap: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('client/build/js'))
    .pipe(size({title: 'scripts'}));
});

// Конкатинирует и минифицирует CSS, STYLUS, создает sourseMap
gulp.task('styles', function() {
    return gulp.src(['client/src/css/main.styl'])
    .pipe(sourcemaps.init())
    //.pipe(concat('main.styl'))
    .pipe(stylus({compress: true}))
    .pipe(autoprefixer({browsers: ['last 2 versions']}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('client/build/css'))
    .pipe(size({title: 'styles'}));
});

// Копирует шрифты
gulp.task('fonts', function() {
    return gulp.src(['client/src/fonts/**'])
    .pipe(gulp.dest('client/build/fonts'))
    .pipe(size({title: 'fonts'}));
});

// Сжимает изображения (gif, jpg, png, svg) без потерь
gulp.task('images', function() {
    return gulp.src(['client/src/img/**/*'])
    .pipe(cache(imagemin({
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest('client/build/img'))
    .pipe(size({title: 'images'}));
});

// Копирует и минифицирует все html страницы
gulp.task('html', function() {
    return gulp.src(['client/src/*.html'])
    .pipe(minifyHTML())
    .pipe(gulp.dest('client/build'))
    .pipe(size({title: 'html'}));
});

// Копирует все файлы из корня, кроме html
gulp.task('copy', function() {
    return gulp.src(['client/src/*', '!client/src/*.html'])
    .pipe(gulp.dest('client/build'))
    .pipe(size({title: 'copy'}));
});

//Копирует главные файлы из bower_components/ в src/lib/
gulp.task('mainBowerFiles', function() {
    return gulp.src(mainBowerFiles({'overrides': {
        'twemoji': { main: 'twemoji.js'}
    }}))
    .pipe(gulp.dest('client/lib'));
});

// Минификация JavaScript библиатек, создание sourcemap
gulp.task('lib-js', function() {
    return gulp.src(['client/lib/*.js'])
    .pipe(sourcemaps.init())
    .pipe(uglify({
        preserveComments: 'some',
        outSourceMap: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('client/build/js'))
    .pipe(size({title: 'lib-js'}));
});

// Минификация css библиатек, создание sourcemap
gulp.task('lib-css', function() {
    return gulp.src(['client/lib/*.css'])
    .pipe(sourcemaps.init())
    .pipe(stylus({compress: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('client/build/css/'))
    .pipe(size({title: 'lib-css'}));
});

// Проверка всех JS файлов в папке src/js
gulp.task('jslint', function() {
    return gulp.src(['client/src/js/**/*.js', 'server/**/*.js', '*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('default', { verbose: true }));
});

// Проверка стиля javascript
gulp.task('jscs', function() {
    return gulp.src(['client/src/js/**/*.js', 'server/**/*.js', '*.js'])
        .pipe(jscs())
        .pipe(jscs.reporter());
});

// Проверка всех stylus файлов в папке client/src/css
gulp.task('stylint', function() {
    return gulp.src('client/src/css/**/*.styl')
        .pipe(stylint())
        .pipe(stylint.reporter())
        .pipe(stylint.reporter('fail'));
});

// Запускает локальный http сервер, следит за изменениями
gulp.task('serve', function() {
    browserSync.init({
        notify: false,
        server: 'client/build',
        baseDir: 'client/build'
    });

    gulp.watch(['client/src/*.html'], ['html', browserSync.reload]);
    gulp.watch(['client/src/*', '!client/src/*.html'], ['copy', browserSync.reload]);
    gulp.watch(['client/src/js/**/*.js', 'client/src/lib/*.js'], ['scripts', browserSync.reload]);
    gulp.watch(['client/src/css/**/*.{css,styl}', 'client/src/lib/*.css'], ['styles', browserSync.reload]);
    gulp.watch(['client/src/fonts/**'], ['fonts', browserSync.reload]);
    gulp.watch(['client/src/img/**/*'], ['images', browserSync.reload]);
});

gulp.task('bower', ['mainBowerFiles'], function() {
    gulp.run(['lib-js', 'lib-css']);
});
gulp.task('lint', ['jslint', 'jscs', 'stylint']);
gulp.task('build', ['clean', 'clear', 'bower', 'copy', 'html', 'images', 'fonts', 'scripts', 'styles']);
gulp.task('default', ['build']);
