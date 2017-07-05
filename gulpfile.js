/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
require('dotenv').config({ silent: true });

const del = require('del');
const exec = require('child_process').exec;
const ftp = require('vinyl-ftp');
const gulp = require('gulp');
const minimatch = require('minimatch');
const $ = require('gulp-load-plugins')();
const Q = require('q');
const wbBuild = require('workbox-build');

const deferredCompile = Q.defer();
const ftpRemoteFolder = process.env.FTP_REMOTE_FOLDER;
const ftpServerConn = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  parallel: process.env.FTP_PARALLEL,
  log: $.util.log,
};
const gulpEnvName = process.env.GU_ENV_NAME;
const gulpOutputDir = process.env.GU_OUTPUT_DIR;
const gulpSiteMapSiteUrl = process.env.GU_SM_SITE_URL;
const gulpPersistenceDir = process.env.GU_PERSISTENCE_DIR;
const gulpGoogleSiteVer = process.env.GU_GOOGLE_SITE_VER;
const spikeOutputDir = process.env.SP_OUTPUT_DIR;

// -----------------------------------------------------------------------------

// Delete output folders but NEVER DELETE PERSISTENCE FOLDER since it keeps
// history of page's last modification date.
// spikeOutputDir is dumped in order to avoid dev artfacts to get uploaded to FTP
gulp.task('dump-output-folders', () => {
  return del([
    `${spikeOutputDir}/**/{*,.*}`,
    `${gulpOutputDir}/**/{*,.*}`,
    `!${gulpOutputDir}/${gulpPersistenceDir}`,
    `!${gulpOutputDir}/${gulpPersistenceDir}/**/{*,.*}`,
  ]);
});

// -----------------------------------------------------------------------------

// Execute spike compile
gulp.task('compile-spike-project', ['dump-output-folders'], () => {
  exec(`spike compile -e ${gulpEnvName}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.warn(stdout);
    console.error(stderr);
    deferredCompile.resolve();
  });
  return deferredCompile.promise;
});

// -----------------------------------------------------------------------------

// Create new deployment folder and take opportunity to clean data:
// - remove comments in htaccess
gulp.task('generate-deploy-folder', ['compile-spike-project'], () => {
  const htaccessFile = $.filter(file => minimatch(file.relative, '.htaccess', { dot: true }), { restore: true });
  return gulp.src(`${spikeOutputDir}/**/{*,.*}`)
    .pipe(htaccessFile)
    .pipe($.replace(/^(?:\s*)?#.*/gm, ''))
    .pipe($.replace(/^\s*$/gm, ''))
    .pipe(htaccessFile.restore)
    .pipe(gulp.dest(gulpOutputDir));
});

// -----------------------------------------------------------------------------

// hash all images
// Hash them first since they do not depend on any other asset.
// Css files will be hashed in next step.
// JS will be hashed in last step. It needs particular attention because it
// can contain templates (and therefore refers to css, img)
gulp.task('img-revision', ['generate-deploy-folder'], () => {
  return gulp.src([
    `${gulpOutputDir}/img/**/*.{gif,jpeg,jpg,png,svg,bmp,cur,ico,webp}`,
  ], { base: gulpOutputDir })
    .pipe($.rev())
    .pipe(gulp.dest(gulpOutputDir))
    .pipe($.revDeleteOriginal())
    .pipe($.rev.manifest('rev-manifest-img.json'))
    .pipe(gulp.dest(gulpOutputDir));
});

// -----------------------------------------------------------------------------

// Update references of all images
// In css, html, & js files
gulp.task('img-replace', ['img-revision'], () => {
  const manifestImg = gulp.src(`${gulpOutputDir}/rev-manifest-img.json`);
  return gulp.src([
    `${gulpOutputDir}/css/**/*.css`,
    `${gulpOutputDir}/**/*.{htm,html}`,
    `${gulpOutputDir}/js/**/*.js`,
    `${gulpOutputDir}/js/**/*.map`,
    `!${gulpOutputDir}/${gulpPersistenceDir}/**/{*,.*}`,
  ], { base: gulpOutputDir })
    .pipe($.revReplace({ manifest: manifestImg }))
    .pipe(gulp.dest(gulpOutputDir));
});

// -----------------------------------------------------------------------------

// references of all images have been updated so now we can generate hashes for css files
gulp.task('css-revision', ['img-replace'], () => {
  return gulp.src([
    `${gulpOutputDir}/css/**/*.css`,
  ], { base: gulpOutputDir })
    .pipe($.rev())
    .pipe(gulp.dest(gulpOutputDir))
    .pipe($.revDeleteOriginal())
    .pipe($.rev.manifest('rev-manifest-css.json'))
    .pipe(gulp.dest(gulpOutputDir));
});

// -----------------------------------------------------------------------------

// Update references of css files in html, js files
gulp.task('css-replace', ['css-revision'], () => {
  const manifestCss = gulp.src(`${gulpOutputDir}/rev-manifest-css.json`);
  return gulp.src([
    `${gulpOutputDir}/**/*.{htm,html}`,
    `${gulpOutputDir}/js/**/*.js`,
    `${gulpOutputDir}/js/**/*.map`,
    `!${gulpOutputDir}/${gulpPersistenceDir}/**/{*,.*}`,
  ], { base: gulpOutputDir })
    .pipe($.revReplace({ manifest: manifestCss }))
    .pipe(gulp.dest(gulpOutputDir));
});

// -----------------------------------------------------------------------------

// all assets have been hashed so now we can generate a hash for JS
gulp.task('js-revision', ['css-replace'], () => {
  return gulp.src([
    `${gulpOutputDir}/js/**/*.js`,
    `${gulpOutputDir}/js/**/*.map`,
  ], { base: gulpOutputDir })
    .pipe($.rev())
    .pipe(gulp.dest(gulpOutputDir))
    .pipe($.revDeleteOriginal())
    .pipe($.rev.manifest('rev-manifest-js.json'))
    .pipe(gulp.dest(gulpOutputDir));
});

// -----------------------------------------------------------------------------

// Update references of js in HTML &  JS (circular references)
gulp.task('js-replace', ['js-revision'], () => {
  const manifestJs = gulp.src(`${gulpOutputDir}/rev-manifest-js.json`);
  return gulp.src([
    `${gulpOutputDir}/**/*.{htm,html}`,
    `${gulpOutputDir}/js/**/*.js`,
    `${gulpOutputDir}/js/**/*.map`,
    `!${gulpOutputDir}/${gulpPersistenceDir}/**/{*,.*}`,
  ], { base: gulpOutputDir })
    .pipe($.revReplace({ manifest: manifestJs }))
    .pipe(gulp.dest(gulpOutputDir));
});

// -----------------------------------------------------------------------------

// Remove from deployment folder all unecessary files !
gulp.task('drop-unnecessary-files', ['js-replace'], () => {
  return del(`${gulpOutputDir}/rev-manifest*.json`);
});

// -----------------------------------------------------------------------------

// Pages are always overwrited in dist folder, so we need a way to
// keep last modification dates, compilations after compilations. This is done
// By never erasing persistent folder and updating it at every new compilation.
gulp.task('pages-lastmod-update', ['drop-unnecessary-files'], () => {
  return gulp.src([
    `${gulpOutputDir}/**/*.{htm,html}`,
    `!${gulpOutputDir}/${gulpGoogleSiteVer}`,
    `!${gulpOutputDir}/${gulpPersistenceDir}/**/{.*,*}`,
  ])
    .pipe($.destClean(`${gulpOutputDir}/${gulpPersistenceDir}`))
    .pipe($.changed(`${gulpOutputDir}/${gulpPersistenceDir}`, { hasChanged: $.changed.compareSha1Digest }))
    .pipe(gulp.dest(`${gulpOutputDir}/${gulpPersistenceDir}`));
});

// -----------------------------------------------------------------------------

// Now we can generate sitemap.xml !
gulp.task('generate-sitemap', ['pages-lastmod-update'], () => {
  return gulp.src([
    `${gulpOutputDir}/${gulpPersistenceDir}/**/*.{htm,html}`,
  ], { base: `${gulpOutputDir}/${gulpPersistenceDir}`, buffer: false, read: false })
    .pipe($.sitemap({
      siteUrl: gulpSiteMapSiteUrl,
    }))
    .pipe(gulp.dest(gulpOutputDir));
});

// -----------------------------------------------------------------------------

// Service Worker generation
gulp.task('bundle-sw', ['generate-sitemap'], () => {
  return wbBuild.generateSW({
    globDirectory: gulpOutputDir,
    swDest: `${gulpOutputDir}/sw.js`,
    globPatterns: ['**/*.{html,png,xml,css,ico,txt,json,svg,js,map,gif,jpeg,jpg,bmp,cur,webp}'],
    // cacheId: `liit-www-${+new Date()}`,
    skipWaiting: true,
    clientsClaim: true,
  })
  .then(() => {
    console.warn('Service worker generated.');
  })
  .catch((err) => {
    console.error(`[ERROR] This happened: ${err}`);
  });
});

// -----------------------------------------------------------------------------

// We can now start to upload files to FTP. First we'll only upload assets files
// In order to preserve navigation for concurrent website visitors session
gulp.task('deploy-ftp-assets', ['bundle-sw'], () => {
  const conn = ftp.create(ftpServerConn);
  return gulp.src([
    `${gulpOutputDir}/**/{*,.*}`,
    `!${gulpOutputDir}/**/*.{htm,html}`,
    `!${gulpOutputDir}/${gulpPersistenceDir}`,
    `!${gulpOutputDir}/${gulpPersistenceDir}/**/{.*,*}`,
  ], { base: gulpOutputDir, buffer: false })
    .pipe(conn.dest(ftpRemoteFolder));
});

// -----------------------------------------------------------------------------

// Once assets have been uploaded first, we can deploy pages
gulp.task('deploy-ftp-pages', ['deploy-ftp-assets'], () => {
  const conn = ftp.create(ftpServerConn);
  return gulp.src([
    `${gulpOutputDir}/**/*.{htm,html}`,
    `${gulpOutputDir}/sitemap.xml`,
    `!${gulpOutputDir}/${gulpPersistenceDir}`,
    `!${gulpOutputDir}/${gulpPersistenceDir}/**/{.*,*}`,
  ], { base: gulpOutputDir, buffer: false })
    .pipe(conn.dest(ftpRemoteFolder))
    .pipe($.notify({
      message: 'Remote site successfully updated !',
      onLast: true,
    }));
});

// -----------------------------------------------------------------------------

// Main task ...
gulp.task('default', [
  'dump-output-folders',
  'compile-spike-project',
  'generate-deploy-folder',
  'img-revision',
  'img-replace',
  'css-revision',
  'css-replace',
  'js-revision',
  'js-replace',
  'drop-unnecessary-files',
  'pages-lastmod-update',
  'generate-sitemap',
  'bundle-sw',
  'deploy-ftp-assets',
  'deploy-ftp-pages',
]);

// -----------------------------------------------------------------------------
// UTILS
// -----------------------------------------------------------------------------

// Remove old hashed assets, use it from time to time to save some room on your FTP server
// Warning : double check that gulpOutputDir is still here !
gulp.task('drop-former-assets', () => {
  const conn = ftp.create(ftpServerConn);
  return conn.clean(`${ftpRemoteFolder}/**/*.{gif,jpeg,jpg,png,svg,js,css}`, gulpOutputDir);
});

// -----------------------------------------------------------------------------

// Remove project folder deployed on FTP server, think twice !
gulp.task('drop-remote', () => {
  const conn = ftp.create(ftpServerConn);
  return conn.rmdir(ftpRemoteFolder, () => {
    console.warn('Remote site successfully deleted !');
  });
});
