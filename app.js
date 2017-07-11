require('dotenv').config({ silent: true });

const htmlStandards = require('reshape-standard');
const cssStandards = require('spike-css-standards');
const jsStandards = require('spike-js-standards');
const pageId = require('spike-page-id');
const fs = require('fs');
const path = require('path');
const { _ } = require('lodash');
const { ProvidePlugin } = require('webpack');

const env = process.env.NODE_ENV;

const entry = Object.assign({}, ..._.map(_.filter(fs.readdirSync('./assets/js/'), file => file.charAt(0) !== '_'), file =>
  _.fromPairs([[`js/${path.parse(file).name}`, `./assets/js/${file}`]])));

module.exports = {
  devtool: 'source-map',
  matchers: {
    html: '*(**/)*.sgr',
    css: '*(**/)*.sss',
  },
  ignore: ['**/layout.sgr', '**/_*', '.*', 'readme.md', 'yarn.lock'],
  reshape: htmlStandards({
    locals: ctx => ({ pageId: pageId(ctx) }),
    minify: env === 'production',
  }),
  postcss: cssStandards({
    minify: env === 'production',
    warnForDuplicates: env !== 'production',
  }),
  babel: jsStandards(),
  entry,
  outputDir: process.env.SP_OUTPUT_DIR,
  plugins: [
    new ProvidePlugin({
      THREE: 'three/build/three',
    }),
  ],
  resolve: {
    alias: {
      CanvasRenderer: path.resolve(__dirname, 'node_modules/three/examples/js/renderers/CanvasRenderer.js'),
      Projector: path.resolve(__dirname, 'node_modules/three/examples/js/renderers/Projector.js'),
      TweenLite: path.resolve(__dirname, 'node_modules/gsap/src/uncompressed/TweenLite.js'),
      AttrPlugin: path.resolve(__dirname, 'node_modules/gsap/src/uncompressed/plugins/AttrPlugin.js'),
    },
  },
  dumpDirs: ['views', 'assets', 'favicons', 'www'],
};
