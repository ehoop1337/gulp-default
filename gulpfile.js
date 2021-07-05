const gulp       = require('gulp'), // Подключаем Gulp
	sass         = require('gulp-sass')(require('sass')), //Подключаем Sass пакет,
	browserSync  = require('browser-sync'), // Подключаем Browser Sync
	concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов
 

gulp.task('csslibs-to-basemincss', function() {
	return gulp.src('app/libs/css/**/*.css')
		.pipe(concat('bundle.css'))
		.pipe(gulp.dest('./app/css/'));
		// .pipe(cssnano())
		// .pipe(rename({suffix: '.min'}))
		// .pipe(gulp.dest('./app/css/'));
});

gulp.task('jslibs-to-baseminjs', function() {
	return gulp.src('app/libs/js/**/*.js')
		.pipe(concat('bundle.js'))
		.pipe(gulp.dest('./app/js/'));
		// .pipe(uglify())
		// .pipe(rename({suffix: '.min'}))
		// .pipe(gulp.dest('./app/js/'));
});

// Минимизируем JS
// gulp.task('js-to-minjs', function() {
// 	return gulp.src('./app/js/**/*.js')
// 		.pipe(uglifyjs())
// 		.pipe(rename({suffix: '.min'}))
// 		.pipe(gulp.dest('./dist/js/'))
// });

// Преобразуем SCSS в CSS, ставим префиксы, перемещаем в папку app/css
gulp.task('sсss-to-css', function() {
	return gulp.src('./app/scss/**/*.scss')
		.pipe(sass())
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(gulp.dest('./app/css/'))
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./app/css/'))
});


// Следим за изменениями HTML
gulp.task('html', function() {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({stream: true}))
}); 

// Следим за изменениями CSS
gulp.task('css', function() {
	return gulp.src(['app/css/*.css','app/scss/*.scss'])
	.pipe(browserSync.reload({stream: true}))
});

// Следим за изменениями JS
gulp.task('js', function() {
	return gulp.src('app/js/*.js')
	.pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});
 
gulp.task('watch', function() {
	gulp.watch('app/*.html', gulp.parallel('html'));
	gulp.watch('app/scss/*.scss', gulp.parallel('sсss-to-css'));
	gulp.watch('app/css/*.css', gulp.parallel('css'));
	gulp.watch('app/js/*.js', gulp.parallel('js'));
});

gulp.task(
	'default', 
	gulp.parallel(
		'csslibs-to-basemincss',
		'jslibs-to-baseminjs',
		'sсss-to-css',
		'browser-sync', 
		'watch'
	)
);

gulp.task(
	'clean', 
	function (callback) {
		return cache.clearAll();
	}
);

gulp.task('img', function() {
	return gulp.src('app/img/**/*')
		.pipe(cache(imagemin([
		    imagemin.gifsicle({interlaced: true}),
		    imagemin.mozjpeg({quality: 75, progressive: true}),
		    imagemin.optipng({optimizationLevel: 5, }),
		    imagemin.svgo({
		        plugins: [
		            {removeViewBox: true},
		            {cleanupIDs: false}
		        ]
		    })
		])))
		.pipe(gulp.dest('./dist/img/'));
});

gulp.task(
	'prebuild', async function() {
		var buildCss = gulp.src('app/css/**/*').pipe(gulp.dest('./dist/css/'));
		var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('./dist/fonts/'));
		var buildJs = gulp.src('app/js/**/*').pipe(gulp.dest('./dist/js/'));
		var buildHtml = gulp.src('app/*.html').pipe(gulp.dest('./dist/'));
	}
);

gulp.task(
	'build', 
	gulp.parallel(
		'clean', 
		//'js-to-minjs',
		'jslibs-to-baseminjs',
		'csslibs-to-basemincss',
		'sсss-to-css',
		'img',
		'prebuild'
	)
);
