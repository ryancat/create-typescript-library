// Using typescript configuration is now supported.
// See https://webpack.js.org/configuration/configuration-languages/#typescript
import path from 'path';
import webpack from 'webpack';

const configCallback = (env: {[key: string]: string}, argv: webpack.Configuration): webpack.Configuration => {
  const mode = argv.mode || 'development';
  console.info('running webpack with mode:', mode);

  const config: webpack.Configuration = {
    mode,

    entry: {
      myLib: './src/myLib.ts',
    },

    output: {
      filename: mode === 'production' ? '[name].min.js' : '[name].js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'umd',
      library: 'myLib',
      umdNamedDefine: true,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },

    module: {
      rules: [{
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }],
    },
  };

  if (mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
};

export default configCallback;
