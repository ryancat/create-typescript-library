const path = require('path');

module.exports = function (env, argv) {
  const mode = argv.mode || 'development';
  console.info('running webpack with mode:', mode);

  return {
    mode: mode,

    entry: {
      'myLib': './src/myLib.ts'
    },
  
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: mode === 'production' ? '[name].min.js' : '[name].js',
      libraryTarget: 'umd',
      library: 'myLib',
      umdNamedDefine: true
    },
    
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    
    devtool: mode === 'production' ? '' : 'inline-source-map',
    
    module: {
      rules: [{
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }]
    }
  };
};
