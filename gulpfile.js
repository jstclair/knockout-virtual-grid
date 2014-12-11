"use strict";

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    del = require('del'),
    runSequence = require('run-sequence');

var paths = {
    out: './out/'
};

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
    ];

gulp.task('clean', function() {
    del(['./out/*', '.tmp/**', 'src/*.js', 'src/*.js.map'], { dot: true});
});

gulp.task('ts', function() {
    return gulp.src(['src/*.ts'])
        .pipe($.tsc({
            module: 'amd',
            target: 'es5',
            emitError: false,
            sourcemap: true,
            keepTree: false,
            outDir: './'
        }))
        .on('error', console.error.bind(console))
        .pipe(gulp.dest('src'));
});

gulp.task('js', ['ts'], function() {
    return gulp.src(['src/*.js'])
        .pipe($.concat('knockout-virtual-grid.js'))
        .pipe(gulp.dest(paths.out))
        .pipe($.uglify())
        .pipe($.rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest(paths.out));
});

gulp.task('copy-typedefs', function() {
    return gulp.src(['src/knockout-virtual-grid.d.ts'])
        .pipe(gulp.dest(paths.out));
});

gulp.task('styles', function() {
    return gulp.src(['styles/*.scss'])
        .pipe($.sass({
            precision: 10
        }))
        .on('error', console.error.bind(console))
        .pipe($.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
        .pipe(gulp.dest(paths.out))
        .pipe($.csso())
        .pipe($.rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest(paths.out));
});

gulp.task('html', function() {
    return gulp.src(['src/knockout-virtual-grid.html'])
        .pipe(gulp.dest(paths.out));
});

gulp.task('watch', function() {
    gulp.watch(['src/*.ts', 'src/*.d.ts'], ['js']);
    gulp.watch(['src/*.html'], ['html']);
    gulp.watch(['src/*.d.ts'], ['copy-typedefs']);
    gulp.watch(['src/css/*.scss'], ['styles']);
});

gulp.task('default', ['clean'], function(cb){
    runSequence(['watch', 'js', 'html', 'copy-typedefs', 'styles'], cb);
});
