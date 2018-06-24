const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: {
    'myLib': './src/myLib.ts',
    'myLib.min': './src/myLib.ts'
  },

  output: {
    path: path.resolve(__dirname, 'bundles'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'myLib',
    umdNamedDefine: true
  },
  
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  
  devtool: 'inline-source-map',
  
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/
    }]
  },

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        include: /\.min\.js$/
      })
    ]
  }
}