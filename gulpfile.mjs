import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import nunjucksRender from 'gulp-nunjucks-render';
import useref from 'gulp-useref';
import uglify from 'gulp-uglify';
import htmlBeautify from 'gulp-html-beautify';
import htmlmin from 'gulp-htmlmin';
import postcss from 'gulp-postcss';
import gulpIf from 'gulp-if';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';
import data from 'gulp-data';
import plumber from 'gulp-plumber';
import cache from 'gulp-cache';
import fs from 'fs';
import imageminOptipng from 'imagemin-optipng';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminSVGO from 'imagemin-svgo';
import lazypipe from 'lazypipe';

const sassCompiler = gulpSass(sass);

var config = {
    global: {
        input: 'src',
        output: 'dist',
        tmp: '.tmp'
    },
    fonts: {
        input: 'src/fonts/**/*',
        output: 'dist/fonts',
        tmp: '.tmp/fonts'
    },
    html: {
        input: 'src/**/*.{html,njk}',
        pages: ['src/*.{html,njk}', 'src/sub/*.{html,njk}'],
        layouts: 'src/templates/layouts/*.{html,njk}',
        tmp: '.tmp/**/*.html',
        output: 'dist/**/*.html',
        data: './src/data.json'
    },
    images: {
        input: 'src/images/**/*',
        output: 'dist/images',
        tmp: '.tmp/images'
    },
    scripts: {
        input: 'src/js/**/*.js',
        output: 'dist/js',
        tmp: '.tmp/js'
    },
    static: {
        input: ['src/*.*', '!src/*.{html,njk}', '!src/data.json'],
        size: 'dist/**/*'
    },
    styles: {
        input: 'src/scss/main.{scss,sass}',
        output: 'dist/css',
        tmp: '.tmp/css',
        all: 'src/scss/**/*.{scss,sass}'
    }
}

/* STYLES TASK
 * --------------------------------------------------
 *  Compile SCSS, autoprefix and make sourcemap
 * -------------------------------------------------- */
export function styles() {
    return gulp
    .src(config.styles.input)
    .pipe(plumber())
    .pipe(sassCompiler({
        outputStyle: 'expanded',
        includePaths: ['.']
    }))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(config.styles.tmp))
    .pipe(browserSync.stream());
}

export function stylesBuild() {
    return gulp
    .src(config.styles.input)
    .pipe(plumber())
    .pipe(sassCompiler({
        outputStyle: 'expanded',
        includePaths: ['.']
    }))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(config.styles.output));
}

/* SCRIPTS TASK
 * --------------------------------------------------
 *  Copy js files to .tmp/dist
 * -------------------------------------------------- */
export function scripts() {
    return gulp.src(config.scripts.input)
        .pipe(plumber())
        .pipe(gulp.dest(config.scripts.tmp))
        .pipe(browserSync.stream());
};

export function scriptsBuild() {
    return gulp.src(config.scripts.input)
        .pipe(plumber())
        .pipe(gulp.dest(config.scripts.output));
};

/* IMAGES TASK
 * --------------------------------------------------
 *  Compress images - PNG, JPG, GIF and SVG
 *  Doesn't remove IDs from SVG files
 * -------------------------------------------------- */
export function images() {
    return gulp.src(config.images.input)
    .pipe(plumber())
    .pipe(cache(imagemin([
        imageminOptipng({ optimizationLevel: 6 }),
        imageminMozjpeg({ optimizationLevel: 75, progressive: true }),
        imageminGifsicle({ interlaced: true }),
        imageminSVGO({
            plugins: [{ cleanupIDs: false }]
        })
    ])))
    .pipe(gulp.dest(config.images.tmp))
    .pipe(browserSync.stream());
};

export function imagesBuild() {
    return gulp.src(config.images.input)
    .pipe(plumber())
    .pipe(cache(imagemin([
        imageminOptipng({ optimizationLevel: 6 }),
        imageminMozjpeg({ optimizationLevel: 75, progressive: true }),
        imageminGifsicle({ interlaced: true }),
        imageminSVGO({
            plugins: [{ cleanupIDs: false }]
        })
    ])))
    .pipe(gulp.dest(config.images.output));
};

/* NUNJUCKS TASK
 * --------------------------------------------------
 *  Render Nunjucks template(s) to HTML and sync
 *  data from data.json on change
 * -------------------------------------------------- */
export function templates() {
    return gulp
        .src(config.html.pages, { base: 'src' })
        .pipe(plumber())
        .pipe(data(function () {
            // return require(config.html.data)
            return JSON.parse(fs.readFileSync(config.html.data))
        }))
        .pipe(nunjucksRender({
            path: ['src']
        }))
        .pipe(gulp.dest(config.global.tmp))
        .pipe(browserSync.stream());
};

export function templatesBuild() {
    return gulp
        .src(config.html.pages, { base: 'src' })
        .pipe(plumber())
        .pipe(data(function () {
            // return require(config.html.data)
            return JSON.parse(fs.readFileSync(config.html.data))
        }))
        .pipe(nunjucksRender({
            path: ['src']
        }))
        .pipe(gulp.dest(config.global.output));
};

export function userefHtml() {
    var plugins = [
        cssnano({
            autoprefixer: false,
            safe: true,
            discardComments: {
                removeAll: true
            }
        })
    ];

    return gulp
        .src(config.html.output)
        .pipe(plumber())
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', postcss(
            plugins
        )))
        .pipe(gulpIf('*.html', htmlmin({ collapseWhitespace: true, removeComments: true, preserveLineBreaks: true })))
        .pipe(gulpIf('*.html', htmlBeautify({indent_size: 4})))
        .pipe(gulp.dest(config.global.output));
};

/* FONTS TASK
 * --------------------------------------------------
 *  Move font files to .tmp folders  
 * -------------------------------------------------- */
export function fonts() {
    return gulp.src(config.fonts.input)
        .pipe(gulp.dest(config.fonts.tmp))
        .pipe(browserSync.stream());
};

export function fontsBuild() {
    return gulp.src(config.fonts.input)
        .pipe(gulp.dest(config.fonts.output));
};

/* WATCH TASK
 * --------------------------------------------------
 *  Livereload with browserSync, watch files on 
 *  change and execute tasks accordingly
 * -------------------------------------------------- */
export function watch() {
    browserSync.init({
        server: {
            baseDir: [config.global.tmp],
            routes: {
                '/node_modules': 'node_modules',
                '/dist': 'dist',
                '/tests': 'tests',
                '/.tmp': '.tmp'
            },
            serveStaticOptions: {
                extensions: ['html']
            }
        },
        notify: false,
        port: 3014
    });

    gulp.watch(config.styles.all, styles);
    gulp.watch(config.scripts.input, scripts);
    gulp.watch([config.html.input, config.html.data], templates);
    gulp.watch(config.images.input, images);
    gulp.watch(config.fonts.input, fonts);
    //gulp.watch('.tmp/*.*').on('change', browserSync.reload);
};

/* CLEAN TASK
 * --------------------------------------------------
 *  Deletes dist/ and .tmp/ folder
 * -------------------------------------------------- */
export async function clean() {
    try {
        await fs.promises.rm(config.global.tmp, { recursive: true });
    } catch (error) {
        console.error('Error deleting dist folder:', error);
    }
}

export async function cleanBuild() {
    try {
        await fs.promises.rm(config.global.output, { recursive: true });
    } catch (error) {
        console.error('Error deleting dist folder:', error);
    }
}

/* STATIC TASK
 * --------------------------------------------------
 *  Move static files to dist/ folder (robots.txt,
 *  humans.txt, favicon). Hidden files will be
 *  ignored (.git for example)
 * -------------------------------------------------- */
export function staticFiles() {
    return gulp.src(config.static.input, {
        dot: true
    }).pipe(gulp.dest(config.global.output));
};

/* BUILD AND DEV TASK
 * --------------------------------------------------
 *  Task to run local dev server watching files
 *  Task to create procduction ready build
 * -------------------------------------------------- */
const dev = gulp.series(
    clean,
    styles,
    scripts,
    images,
    fonts,
    templates,
    watch
);

const build = gulp.series(
    cleanBuild,
    stylesBuild,
    scriptsBuild,
    imagesBuild,
    fontsBuild,
    templatesBuild,
    staticFiles,
    userefHtml
);

const minify = gulp.series(
    stylesBuild,
    scriptsBuild,
    templatesBuild,
    userefHtml
);

export {
    minify,
    build,
    dev
}

export default dev;