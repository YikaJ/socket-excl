var gulp = require('gulp'),
	plugins = require('gulp-load-plugins'),
	$ = plugins();

gulp.task("jshint", function(){
	return gulp.src("js/*.js")
		.pipe($.jshint())
		.pipe($.jshint.reporter('default'));
});

gulp.task('minify', function(){
	return gulp.src('js/*.js')
		.pipe($.changed('dist'))
		.pipe($.uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', function(){
	gulp.watch('js/*.js', ['jshint', 'minify']);
});

gulp.task('default', ['jshint', 'minify', 'watch'], function(){
});