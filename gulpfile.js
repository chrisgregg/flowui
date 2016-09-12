'use strict';

const gulp = require('gulp');
const debug = require('gulp-debug');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const tap = require('gulp-tap');
const gutil = require('gulp-util');

const config = {
    namespace: "FlowUI",
    srcFiles : {
        js: [
            {path: './src/index.js', moduleName: null},
            {path: './src/modal/js/index.js', moduleName: 'modal'},
            {path: './src/loader/js/index.js', moduleName: 'loader'},
            {path: './src/dialog/js/index.js', moduleName: 'dialog'}
        ],
        sass: [
            {path: './src/main.scss', moduleName: null},
            {path: './src/modal/sass/main.scss', moduleName: 'modal'},
            {path: './src/loader/sass/main.scss', moduleName: 'loader'},
            {path: './src/dialog/sass/main.scss', moduleName: 'dialog'}
        ]
    }
};


/* ------------------------------------------------------------ */
/* Compile JS                                                   */
/* ------------------------------------------------------------ */
gulp.task('js:build', function () {



    var tasks = config.srcFiles.js.map(function(entry) {

        var fileName =  config.namespace.toLowerCase() + (entry.moduleName ? "." + entry.moduleName : "") + ".js";
        var destinationPath = './dist' + (entry.moduleName ? '/' + entry.moduleName : '/');

        return browserify({
            entries: [entry.path],
            debug: true,
            standalone: config.namespace
        })
            .transform(babelify, {presets: ["es2015"],sourceMaps:true})
            .bundle()
            .pipe(source(entry.path))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(rename(fileName))
            .pipe(gulp.dest(destinationPath))
            .pipe(uglify())
            .pipe(rename({
                extname: '.min.js'
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(destinationPath))
            .pipe(gutil.noop())
    });

    return tasks;




});


/* ------------------------------------------------------------ */
/* Compile SASS to CSS                                          */
/* ------------------------------------------------------------ */
gulp.task('css:build', function () {


    var tasks = config.srcFiles.sass.map(function(entry) {

        var fileName =  config.namespace.toLowerCase() + (entry.moduleName ? "." + entry.moduleName : "") + ".css";
        var destinationPath = './dist' + (entry.moduleName ? '/' + entry.moduleName : '/');

        gulp.src(entry.path)
            .pipe(sass().on('error', sass.logError))
            .pipe(rename(fileName))
            .pipe(gulp.dest(destinationPath));

    });




});


gulp.task('build', ['js:build', 'css:build']);