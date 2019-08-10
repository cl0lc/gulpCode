import gulp from 'gulp'
import browser from 'browser-sync'
import babel from 'gulp-babel'
import sass from 'gulp-sass'
import uglify from 'gulp-uglify'
import rename from 'gulp-rename'
import changed from 'gulp-changed'
import sourcemaps from 'gulp-sourcemaps'
import del from 'del'

const baseDir = './' // 服务根目录
const outputDir = './dist/' // 编译文件输出目录
// 各种资源的路劲以及编译后输出路径
const path = {
    pages: {
        src: baseDir + 'page/**/*.html'
    },
    styles: {
        src: baseDir + 'src/sass/**/*.scss',
        dist: outputDir + 'css/'
    },
    scripts: {
        src: baseDir + 'src/script/**/*.js',
        dist: outputDir + 'js/'
    }
}
// 创建单个个服务器
const bs = browser.create()

/**
 * 清除打包目录
 */
export const clean = () => del([outputDir])

/**
 * 编译scss并压缩，添加min后缀
 */
export function styles() {
    return gulp.src(path.styles.src)
        // 仅传递改变的文件 
        .pipe(changed(path.styles.dist, { extension: '.css' }))
        // 编译并压缩
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        // 添加后缀
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.styles.dist))
}

/**
 * ES6转ES5，同时压缩js文件，添加min后缀
 */
export function scripts() {
    return gulp.src(path.scripts.src)
        .pipe(sourcemaps.init())
        // 仅传递改变的文件
        .pipe(changed(path.scripts.dist))
        // 编译ES6
        .pipe(babel())
        // 压缩
        .pipe(uglify())
        // 添加后缀
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(path.scripts.dist), { sourcemaps: true })
}
/**
 * 启动本地服务
 */
export function serve() {
    bs.init([path.pages.src, path.styles.src, path.scripts.src], {
        server: {
            baseDir: baseDir
        }
    })

    // 监听删除文件时, 删除编译后文件
    let sassWatcher = gulp.watch(path.styles.src, styles)
    sassWatcher.on('unlink', function (filePath) {
        // 获取文件名
        let pathArr = filePath.split('\\'),
            filename = pathArr[pathArr.length - 1].replace(/scss/, 'min.css')
        del(path.styles.dist + filename)
    })

    let babelWatcher = gulp.watch(path.scripts.src, scripts)
    babelWatcher.on('unlink', function (filePath) {
        // 获取文件名
        let pathArr = filePath.split('\\'),
            filename = pathArr[pathArr.length - 1].replace(/js/, 'min.js')
        del(path.scripts.dist + filename)
    })
}

export default gulp.series(gulp.parallel(styles, scripts), serve)

