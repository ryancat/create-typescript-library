// Using typescript configuration is now supported.
// See https://webpack.js.org/configuration/configuration-languages/#typescript
import path from 'path';
import webpack from 'webpack';

const configCallback = (env: {[key: string]: string}, argv: webpack.Configuration): webpack.Configuration => {
  const mode = argv.mode || 'development';
  console.log('running webpack with mode:', mode);

  const config: webpack.Configuration = {
    mode,

    entry: {
      main: './main.ts',
    },

    // This tells webpack to not mess up with nodejs native packages
    // See https://github.com/webpack-contrib/css-loader/issues/447#issuecomment-308918678
    target: 'node',

    node: {
      // Do not use publicPath to overwrite __dirname, which is confusing
      __dirname: false,
    },

    output: {
      filename: mode === 'production' ? '[name].min.js' : '[name].js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'commonjs',
    },

    resolve: {
      extensions: ['.ts', '.js'],
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
