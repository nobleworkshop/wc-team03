var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var less = require('gulp-less');
var pug = require('gulp-pug');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var del = require('del');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');

// SVG sprites
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');
var replace = require('gulp-replace');
var svgSprite = require('gulp-svgsprite');
var rename = require('gulp-rename');

// Images
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

// HTML, CSS, JS
var usemin = require('gulp-usemin');
var htmlclean = require('gulp-htmlclean');
var uglify = require("gulp-uglify"); // Сжатие JS
var minifyCss = require("gulp-minify-css"); // Сжатие CSS
var rev = require('gulp-rev');

gulp.task('server', function() {
	browserSync.init({
		server: { baseDir: './app/'}
	});

	watch('./app/pug/**/*.pug', function(){
		gulp.start('pug');
	});

	watch('./app/less/**/*.less', function(){
		gulp.start('styles');
	});

	watch('./app/img/svg/*.svg', function(){
		gulp.start('svg');
	});

});

gulp.task('server:docs', function() {
	browserSync.init({
		server: { baseDir: './docs/'}
	});
});

gulp.task('styles', function() {
	return gulp.src('./app/less/**/*.less')
	.pipe(plumber({
		errorHandler: notify.onError(function(err){
			return {
				title: 'Styles',
				message: err.message
			}
		})
	}))
	.pipe(sourcemaps.init())
	.pipe(less())
	.pipe(autoprefixer({
		browsers: ['last 6 versions'],
		cascade: false
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('./app/css'))
	.pipe(browserSync.stream());
});

gulp.task('pug', function() {
	return gulp.src('./app/pug/*.pug')
	.pipe(plumber({
		errorHandler: notify.onError(function(err){
			return {
				title: 'Pug',
				message: err.message
			}
		})
	}))
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest('./app'))
	.pipe(browserSync.stream());
});

gulp.task('svg', function() {
	return gulp.src('./app/img/svg-for-sprites/*.svg')
	.pipe(svgmin({
		js2svg: {
			pretty: true
		}
	}))
	.pipe(cheerio({
		run: function($) {
			$('[fill]').removeAttr('fill');
			$('[stroke]').removeAttr('stroke');
			$('[style]').removeAttr('style');
		},
		parserOptions: { xmlMode: true }
	}))
	.pipe(replace('&gt;', '>'))
	.pipe(svgSprite({
		mode: {
			symbol: {
				sprite: "sprite.svg"
			}
		}
	}))
	.pipe(rename('sprite.svg'))
	.pipe(gulp.dest('./app/img'));
});

gulp.task('del:libs', function() {
    return del('./app/libs');
});

gulp.task('copy:libs', function(callback) {
   
    gulp.src('node_modules/jquery/dist/**/*.*')
		.pipe(gulp.dest('./app/libs/jquery'));

    gulp.src('node_modules/fancybox/dist/**/*.*')
		.pipe(gulp.dest('./app/libs/fancybox'));

	gulp.src('node_modules/bootstrap-4-grid/css/**/*.*')
		.pipe(gulp.dest('./app/libs/bootstrap-4-grid'))

	callback()
});

gulp.task('default', function(callback){
    runSequence(
    	['styles', 'pug', 'svg'],
    	'del:libs',
    	'copy:libs',
    	'server',
		callback
    )
});


/* ------------------------------------
  DIST TASKS
------------------------------------ */

gulp.task('del:docs', function() {
    return del('./docs');
});

gulp.task('img:dist', function() {
    return gulp.src(['./app/img/**/*.{jpg, jpeg, png, gif}', '!./app/img/svg-for-sprites/**/*.svg'])
	.pipe(imagemin({
		progressive: true,
		// optimizationLevel: 5,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()],
		interlaced: true
	}))
    .pipe(gulp.dest('./docs/img'));
});

gulp.task('copy:docs:svg', function() {
	return gulp.src(['./app/img/**/*.svg', '!./app/img/svg-for-sprites/*.svg'])
	.pipe(gulp.dest('./docs/img'));
});

gulp.task('copy:docs:files', function(callback) {
    gulp.src('./app/php/**/*.*')
        .pipe(gulp.dest('./dist/php/'))
    gulp.src('./app/files/**/*.*')
        .pipe(gulp.dest('./dist/files/'))
	gulp.src('./app/fonts/**/*.*')
	        .pipe(gulp.dest('./docs/fonts/'))
	callback()
});

gulp.task('html:docs', function() {
    return gulp.src('./app/*.html')
    	.pipe(usemin({
    		//  <!-- build:cssVendor css/vendor.css --> <!-- endbuild -->
			cssVendor: [function() { return rev() }, function() { return minifyCss() } ], 
			cssCustom: [function() { return rev() }, function() { return minifyCss() } ],
			jsLibs: [function() { return rev() }, function() { return uglify() } ],
			jsVendor: [function() { return rev() }, function() { return uglify() } ],
			jsMain: [function() { return rev() }, function() { return uglify() } ]
    	}))
		.pipe(htmlclean())
	.pipe(gulp.dest('./docs/'));
});

gulp.task('docs', function(callback){
    runSequence(
    	'del:docs',
    	'del:libs',
    	'copy:libs',
    	['styles', 'pug', 'svg'],
    	['html:docs'],
    	['img:dist', 'copy:docs:svg', 'copy:docs:files'],
    	['server:docs'],
		callback
    )
});