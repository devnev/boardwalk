var path = require('path');

module.exports = {
  entry: path.join(__dirname, "src/index.jsx"),
  output: {
    path: __dirname,
    filename: "bundle.js",
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
		exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react'],
          plugins: ['transform-runtime', 'transform-decorators-legacy', 'transform-class-properties'],
        },
      },
    ],
  },
}
