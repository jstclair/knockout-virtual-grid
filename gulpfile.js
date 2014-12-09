var del = require('del'),
    gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

gulp.task('clean', function(done) {
    del(['./out/*.js', '.tmp/**', 'src/*.js', 'src/*.js.map'], function() {
        done();
    });
});

gulp.task('ts', ['clean'], function() {
    return gulp.src(['src/*.ts'])
        .pipe(plugins.tsc({
            module: 'amd',
            target: 'es5',
            emitError: false,
            sourcemap: true,
            keepTree: false,
            outDir: './'
        }))
        .pipe(gulp.dest('src'));
});

var OUT = './out/';

gulp.task('dist', ['ts'], function() {
    return gulp.src(['src/*.js'])
        .pipe(plugins.concat('knockout-virtual-grid.js'))
        .pipe(gulp.dest(OUT))
        .pipe(plugins.uglify())
        .pipe(plugins.rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest(OUT));
});

gulp.task('watch', function() {
    gulp.watch(['src/*.ts', 'src/*.d.ts'], ['dist']);
});

gulp.task('default', ['watch', 'dist']);
