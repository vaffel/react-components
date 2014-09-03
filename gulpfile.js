'use strict';

var _ = require('lodash');
var rimraf = require('gulp-rimraf');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var webpackConfig = require('./webpack.config');
var webpack = require('webpack');
var zopfli = require('gulp-zopfli');
var gutil = require('gulp-util');
var less = require('gulp-less');
var path = require('path');
var gulp = require('gulp');

gulp.task('default', ['less', 'webpack:build', 'clean-compressed']);
gulp.task('watch', ['serve', 'webpack:build-dev'], function() {
    livereload.listen();

    gulp.watch(['app/**/*'], ['webpack:build-dev']);
    gulp.watch(['public/less/**/*.less'], ['less']);
    gulp.watch(['public/css/**/*.css']).on('change', livereload.changed);
});

gulp.task('serve', function() {
    require('./index');
});

gulp.task('less', function() {
    var lessc = less({
        paths: [ path.join(__dirname, 'public', 'less', 'includes') ]
    });

    lessc.on('error',function(e){
        gutil.log(e);
        lessc.end();
    });

    return gulp.src('./public/less/components.less')
        .pipe(sourcemaps.init())
        .pipe(lessc)
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/css'));
});

gulp.task('clean-compressed', function() {
    return gulp.src('./public/**/*.gz', { read: false }).pipe(rimraf());
});

gulp.task('compress-css', function() {
    return gulp.src('./public/css/*.css')
        .pipe(zopfli({ zopfliOptions: { numiterations: 1000 } }))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('compress-dist', function() {
    return gulp.src('./public/dist/*.{js,map}')
        .pipe(zopfli({ zopfliOptions: { numiterations: 1000 } }))
        .pipe(gulp.dest('./public/dist'));
});

gulp.task('compress-js', function() {
    return gulp.src('./public/js/*.js')
        .pipe(zopfli({ zopfliOptions: { numiterations: 1000 } }))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('compress', ['compress-css', 'compress-dist', 'compress-js']);

gulp.task('webpack:build', function(callback) {
    var config = Object.create(webpackConfig);
    config.plugins = config.plugins.concat(
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );

    webpack(config, function(err, stats) {
        if (err) {
            throw new gutil.PluginError('webpack:build', err);
        }

        gutil.log('[webpack:build]', stats.toString({
            colors: true
        }));

        callback();
    });
});

var devConfig = _.merge({}, webpackConfig, {
    devtool: 'source-map',
    debug: true
}), devCompiler = webpack(devConfig);

gulp.task('webpack:build-dev', function(callback) {
    devCompiler.run(function(err, stats) {
        if (err) {
            throw new gutil.PluginError('webpack:build-dev', err);
        }

        gutil.log('[webpack:build-dev]', stats.toString({
            colors: true
        }));

        callback();
    });
});

/** Current unused - might try it again at some point

gulp.task('webpack-dev-server', function() {
    var config = Object.create(webpackConfig);
    config.devtool = 'eval';
    config.debug = true;

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(config), {
        publicPath: '/' + config.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(8080, 'localhost', function(err) {
        if (err) {
            throw new gutil.PluginError('webpack-dev-server', err);
        }

        gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });
});

**/