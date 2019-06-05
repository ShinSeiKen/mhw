const gulp   = require('gulp');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const sass   = require("gulp-sass");

// require('require-dir')('./gulp');

gulp.task('js', function() {
    return gulp.src("./src/script/**/*.js")
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./src/site/assets/script'));
});

gulp.task('css', function() {
    return gulp
        .src('./src/style/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        })
        .on('error', sass.logError))
        .pipe(gulp.dest('./src/site/assets/style'));
});

gulp.task("watch", function() {
    gulp.watch('./src/style/**/*.scss', gulp.parallel('css'));
    gulp.watch('./src/script/**/*.js', gulp.parallel('js'));
});

gulp.task('build', gulp.parallel(
    'css',
    'js'
));

gulp.task('dev', gulp.series(
    'build',
    'watch'
));
