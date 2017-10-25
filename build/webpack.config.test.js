const merge = require('webpack-merge');
const common = require('./webpack.config.common.js');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true },
        },
      },
    ],
  },
});
