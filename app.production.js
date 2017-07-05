const htmlStandards = require('reshape-standard');
const cssStandards = require('spike-css-standards');
const { UglifyJsPlugin } = require('webpack').optimize;
const { ProvidePlugin } = require('webpack');

module.exports = {
  // disable source maps
  devtool: false,
  // minify js
  plugins: [
    new UglifyJsPlugin(),
    new ProvidePlugin({
      THREE: 'three/build/three',
    }),
  ],
  // minify html and css
  reshape: htmlStandards({ minify: true }),
  postcss: cssStandards({
    minify: true,
    // cssnano includes autoprefixer
    warnForDuplicates: false,
  }),
};
