export interface IConfig {
  libName: string;
  libDesc: string;
  hasDemo: boolean;
  hasTest: boolean;
  hasTsLint: boolean;
  isExecutable: boolean;
  // repository: string;
  author: string;
  license: 'MIT' | 'GNU' | 'Apache' | 'other'; // TODO: add more licence options
  testRunner: 'jest'; // TODO: 'mocha' | 'jest'
  // compileMethod: 'bundler' | 'tsc';
  // bundler: 'webpack'; // TODO: 'parcel' | 'browserify' | 'webpack'
  // tsCompileModule: 'none' | 'commonjs' | 'amd' | 'system' | 'umd' | 'es2015' | 'ESNext';
  dependencyManager: 'yarn'; // TODO: 'npm' | 'yarn'
  // outputUmdBundle: boolean;
  // outputEs6Module: boolean;
  // outputCommonJsModule: boolean;
}

export interface IBundlerConfig extends IConfig {
  compileMethod: 'bundler';
  bundler: 'webpack'; // TODO: 'parcel' | 'browserify' | 'webpack'
  outputUmdBundle: boolean;
}

export interface ITscConfig extends IConfig {
  compileMethod: 'tsc';
  tsCompileModule: 'commonjs' | 'es6'; // 'none' | 'commonjs' | 'amd' | 'system' | 'umd' | 'es2015' | 'es6' | 'ESNext';
}

export const webpackConfig: IBundlerConfig = {
  libName: 'my-lib',
  libDesc: 'my awesome library',
  hasDemo: true,
  hasTest: true,
  hasTsLint: true,
  isExecutable: false,
  // repository: 'some repository',
  author: 'Awesome Anonymous <awesome-anonymous@mymail.com>',
  license: 'MIT',
  testRunner: 'jest',
  compileMethod: 'bundler',
  bundler: 'webpack',
  dependencyManager: 'yarn',
  outputUmdBundle: true,
};

export const tscConfig: ITscConfig = {
  libName: 'my-lib',
  libDesc: 'my awesome library',
  hasDemo: true,
  hasTest: true,
  hasTsLint: true,
  isExecutable: false,
  // repository: 'some repository',
  author: 'Awesome Anonymous <awesome-anonymous@mymail.com>',
  license: 'MIT',
  testRunner: 'jest',
  compileMethod: 'tsc',
  tsCompileModule: 'commonjs',
  dependencyManager: 'yarn',
};
