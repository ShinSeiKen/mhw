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

/* Image resizer
var os          = require("os");
var parallel    = require("concurrent-transform");
var imageResize = require('gulp-image-resize');

var resizeImageTasks = [];
[600].forEach(function(size) {
    var resizeImageTask = 'resize_' + size;
    gulp.task(resizeImageTask, function(done) {
        gulp.src('./src/site/assets/img/_weapon-character-iceborne/*')
            .pipe(parallel(
                imageResize({ width : size }),
                os.cpus().length
            ))
            .pipe(gulp.dest('./src/site/assets/img/weapon-character-iceborne/'))
        ;
        done();
    });
    resizeImageTasks.push(resizeImageTask);
});

gulp.task('images', gulp.parallel(resizeImageTasks, function copyOriginalImages(done) {
    gulp.src('./src/site/assets/img/_weapon-character-iceborne/*')
        .pipe(gulp.dest('./src/site/assets/img/weapon-character-iceborne/'));
    done();
}));
//*/
