"use strict";

// Packages
var gulp = require("gulp");
var autoprefixer = require("autoprefixer");
var cleanCSS = require("gulp-clean-css");
var del = require("del");
var header = require("gulp-header");
var pkg = require("./package.json");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var rename = require("gulp-rename");
var sass = require("gulp-sass")(require("node-sass"));
var uglify = require("gulp-uglify");

// File Banner
var banner = "/*! <%= pkg.name %> v<%= pkg.version %> | <%= pkg.license %> License | <%= pkg.homepage %> */\n";

/**
 * Task: 'clean'
 *
 * Remove pre-existing content from output folders
 */
gulp.task(
  "clean",
  gulp.series(function (done) {
    // Clean the dist folder
    del.sync(["assets/"]);

    // Signal completion
    done();
  })
);

/**
 * Task: 'scripts'
 *
 * Concanate & minify JavaScript files
 */
gulp.task(
  "scripts",
  gulp.series(function (done) {
    gulp
      .src("src/whatsappButton.js")
      .pipe(plumber())
      .pipe(header(banner, {pkg: pkg}))
      .pipe(gulp.dest("assets/js/"))
      .pipe(uglify())
      .pipe(
        rename({
          suffix: ".min",
        })
      )
      .pipe(header(banner, {pkg: pkg}))
      .pipe(gulp.dest("assets/js/"));

    // Signal completion
    done();
  })
);

/**
 * Task: 'styles'
 *
 * Compile, autoprefix & minify SASS files
 */
gulp.task(
  "styles",
  gulp.series(function (done) {
    gulp
      .src("scss/whatsappButton.scss")
      .pipe(plumber())
      .pipe(
        sass({
          outputStyle: "expanded",
        })
      )
      .pipe(
        postcss([
          autoprefixer({
            browsers: pkg.browserlist,
            cascade: false,
          }),
        ])
      )
      .pipe(header(banner, {pkg: pkg}))
      .pipe(gulp.dest("assets/css/"))
      .pipe(cleanCSS())
      .pipe(
        rename({
          suffix: ".min",
        })
      )
      .pipe(gulp.dest("assets/css/"));

    // Signal completion
    done();
  })
);

/**
 * Task: 'build'
 *
 * Run all tasks
 */
gulp.task("build", gulp.parallel(["styles", "scripts"]));

/**
 * Task: 'watch'
 *
 * Watch all file changes
 */
gulp.task("watch", function () {
  gulp.watch("src/*.js", gulp.series("scripts"));
  gulp.watch("scss/*.scss", gulp.series("styles"));
});

// Default
gulp.task("default", gulp.series(["clean", "build", "watch"]));
