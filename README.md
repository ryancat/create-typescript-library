## create-typescript-library
[![Build Status](https://travis-ci.com/ryancat/create-typescript-library.svg?branch=master)](https://travis-ci.com/ryancat/create-typescript-library) [![codecov](https://codecov.io/gh/ryancat/create-typescript-library/branch/master/graph/badge.svg)](https://codecov.io/gh/ryancat/create-typescript-library)

This is a nodejs command line util that will setup the basic structure for my (and your) next typescript library.

## How it works?
Simply run `npx create-typescript-library` in an empty directory where you want to create your typescript library. If you are using `yarn`, run `yarn exec create-typescript-library`.

### What it does
`create-typescript-library` will run an interactive prompt to gather information from you, and generate a basic working typescript library for you. Some examples include:
- Use typescript compiler (`tsc`) to compile your library:
  - to commonjs code to consume
  - to es2015 code to consume
- Use webpack version 4 to bundle your library:
  - to UMD module for others
- Setup `npm`/`yarn` scripts for easy build
  - `dev` to compile or bundle code
  - `dev:watch` to watch the file changes (by nodemon) and run the `dev` script
  - `build` to generate minimized code for publishing
  - `test` to run test against bundle results, library and demo

## Useful links
- Refer to [tslint config](https://palantir.github.io/tslint/usage/configuration/) for tslint configuration details
- Refer to [nodemon config](https://github.com/remy/nodemon/blob/master/doc/sample-nodemon.md) for nodemon configuration sample
- Refer to [webpack config](https://webpack.js.org/configuration/) for webpack configuration details

## Special thanks
*Inspired by the awesome blog post [Compiling and bundling TypeScript libraries with Webpack](https://marcobotto.com/blog/compiling-and-bundling-typescript-libraries-with-webpack/) by Marco Botto*