const htmlStandards = require('reshape-standard');
const cssStandards = require('spike-css-standards');
const pageId = require('spike-page-id');
const { UglifyJsPlugin, ModuleConcatenationPlugin } = require('webpack').optimize;
const { ProvidePlugin } = require('webpack');
const sugarml = require('sugarml');

module.exports = {
  devtool: false,
  reshape: htmlStandards({
    locals: ctx => ({ pageId: pageId(ctx) }),
    parser: sugarml,
    minify: { minifySvg: false },
  }),
  postcss: cssStandards({
    minify: true,
    warnForDuplicates: true,
  }),
  plugins: [
    new ProvidePlugin({
      THREE: 'three/build/three',
    }),
    new UglifyJsPlugin(),
    new ModuleConcatenationPlugin(),
  ],
};
