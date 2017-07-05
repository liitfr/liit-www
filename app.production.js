const webpack = require('webpack');
const { UglifyJsPlugin } = require('webpack').optimize;
const { ProvidePlugin } = require('webpack');

module.exports = {
  devtool: false,
  plugins: [
    new ProvidePlugin({
      THREE: 'three/build/three',
    }),
    new UglifyJsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
