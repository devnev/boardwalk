var webpack = require('webpack');

module.exports = function (config) {
  config.set({
    plugins: [
      'karma-webpack',
      'karma-tap',
      'karma-chrome-launcher',
      'karma-sourcemap-loader',
    ],
    browsers: [
      'Chrome',
    ],
    frameworks: [
      'tap',
    ],
    files: [
      'tests.webpack.js',
    ],
    reporters: [
      'dots',
    ],

    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ],
    },
    webpack: {
      devtool: 'inline-source-map',
      node: {
        fs: 'empty',
      },
      resolve: {
        extensions: ['', '.js', '.jsx'],
      },
      module: {
        loaders: [
          {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
              presets: ['es2015', 'react'],
              plugins: ['transform-runtime', 'transform-decorators-legacy', 'transform-class-properties'],
            },
          }
        ]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
  });
};
