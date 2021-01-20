// VARIABLES & PATHS
let preprocessor = 'sass', // Preprocessor (sass, scss, less, styl)
    fileswatch   = 'html,htm,txt,json,md,woff2,php', // List of files extensions for watching & hard reload (comma separated)
    pageversion  = 'html,htm,php', // List of files extensions for watching change version files (comma separated)
    imageswatch  = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
    online       = true, // If «false» - Browsersync will work offline without internet connection
    basename     = require('path').basename(__dirname),
    forProd      = [
					'/**',
					' * @author Alexsab.ru',
					' */',
					''].join('\n');

const { src, dest, parallel, series, watch, task } = require('gulp'),
	sass           = require('gulp-sass'),
	cleancss       = require('gulp-clean-css'),
	concat         = require('gulp-concat'),
	browserSync    = require('browser-sync').create(),
	uglify         = require('gulp-uglify-es').default,
	autoprefixer   = require('gulp-autoprefixer'),
	imagemin       = require('gulp-imagemin'),
	newer          = require('gulp-newer'),
	rsync          = require('gulp-rsync'),
	del            = require('del'),
	connect        = require('gulp-connect-php'),
	header         = require('gulp-header'),
	notify         = require('gulp-notify'),
	rename         = require('gulp-rename'),
	responsive     = require('gulp-responsive'),
	pngquant       = require('imagemin-pngquant'),
	merge          = require('merge-stream'),
	// version        = require('gulp-version-number'),
	// revAll         = require('gulp-rev-all'),
	replace        = require('gulp-replace');

if(typeof projects == 'undefined') 
	global.projects = {};
if(typeof port == 'undefined') 
	global.port = 8100;


projects.slider = {

	port: ++port,

	base: basename,
	dest: basename,

	styles: {
		src:	basename + '/' + preprocessor + '/main.*',
		
		watch:  [
			basename + '/' + preprocessor + '/**/*',
			basename + '/css/common.css',
		],
		dest:   basename + '/css',
		output: 'main.css',
	},

	scripts: {
		src: [
			'node_modules/jquery/dist/jquery.min.js',
			'node_modules/slick-carousel/slick/slick.js',
			basename + '/libs/lazyload/lazyload.js',
			basename + '/js/slider.js', // Always at the end
		],
		dest:       basename + '/js',
		output:     'scripts.min.js',
	},

	code: {
		src: [
			basename  + '/**/*.{' + fileswatch + '}',
			'!' + basename + '/base/objs.json'
		],
	},

	forProd: [
		'/**',
		' * @author https://github.com/newstreetpunk',
		' * @editor https://github.com/alexsab',
		' */',
		''].join('\n'),
}



/* slider BEGIN */

// Local Server
function slider_browsersync() {
	connect.server({
		port: projects.slider.port,
		base: projects.slider.base,
	}, function (){
		browserSync.init({
			// server: { baseDir: projects.slider.base + '/' },
			proxy: '127.0.0.1:' + projects.slider.port,
			notify: false,
			online: online
		});
	});
};

// Custom Styles
function slider_styles() {
	return src(projects.slider.styles.src)
	.pipe(eval(preprocessor)({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(concat(projects.slider.styles.output))
	.pipe(autoprefixer({ grid: true, overrideBrowserslist: ['last 10 versions'] }))
	// .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Optional. Comment out when debugging
	.pipe(dest(projects.slider.styles.dest))
	.pipe(browserSync.stream())

};


// Scripts & JS Libraries
function slider_scripts() {
	return src(projects.slider.scripts.src)
	.pipe(concat(projects.slider.scripts.output))
	// .pipe(uglify()) // Minify js (opt.)
	.pipe(header(projects.slider.forProd))
	.pipe(dest(projects.slider.scripts.dest))
	.pipe(browserSync.stream())
};

function slider_watch() {
	watch(projects.slider.styles.watch, slider_styles);
	watch(projects.slider.scripts.src, slider_scripts);

	watch(projects.slider.code.src).on('change', browserSync.reload);
};

exports.slider = parallel(slider_styles, slider_scripts, slider_browsersync, slider_watch);


/* slider END */

