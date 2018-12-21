## create-ts-library
[![Build Status](https://travis-ci.com/ryancat/create-ts-library.svg?branch=master)](https://travis-ci.com/ryancat/create-ts-library) [![codecov](https://codecov.io/gh/ryancat/create-ts-library/branch/master/graph/badge.svg)](https://codecov.io/gh/ryancat/create-ts-library)

This is a repo that setup the basic structure for my (and your) next typescript library. Simply **fork it** and start coding!

### What it does
- Use typescript compiler to compile your library into:
  - `dist/commonjs` directory for commonjs code to consume
  - `dist/esm` directory for es2015 code to consume
- Use webpack version 4 to bundle the code into:
  - `dist` directory as an UMD module for others 
- Setup yarn scripts for easy build
  - `yarn run dev` to compile to UMD module with `webpack`
  - `yarn run dev:tsc` to compile to commonjs and es6 modules with `tsc`
  - `yarn run dev:watch` to watch the file changes (by nodemon) and run the `dev` script
  - `yarn run build` to generate minimized code for publish using `webpack`
  - `yarn test` to run test against bundle results, library and demo

## Useful links
- Refer to [tslint config](https://palantir.github.io/tslint/usage/configuration/) for tslint configuration details
- Refer to [nodemon config](https://github.com/remy/nodemon/blob/master/doc/sample-nodemon.md) for nodemon configuration sample
- Refer to [webpack config](https://webpack.js.org/configuration/) for webpack configuration details

## Special thanks
*Inspired by the awesome blog post [Compiling and bundling TypeScript libraries with Webpack](https://marcobotto.com/blog/compiling-and-bundling-typescript-libraries-with-webpack/) by Marco Botto*