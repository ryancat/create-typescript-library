export interface IConfig {
  hasDemo: boolean;
  hasTest: boolean;
  hasTsLint: boolean;
  testRunner: 'jest'; // TODO: 'mocha' | 'jest'
  bundler: 'webpack'; // TODO: 'parcel' | 'browserify' | 'webpack'
  dependencyManager: 'yarn'; // TODO: 'npm' | 'yarn'
  outputUmdBundle: boolean;
  outputEs6Module: boolean;
  outputCommonJsModule: boolean;
}

export const config: IConfig = {
  hasDemo: true,
  hasTest: true,
  hasTsLint: true,
  testRunner: 'jest',
  bundler: 'webpack',
  dependencyManager: 'yarn',
  outputUmdBundle: true,
  outputEs6Module: true,
  outputCommonJsModule: true,
};
