// The nodejs executable for generating typescript library
// The program is working off a config given by consumer. From the config,
// the program will composite corresponding components and generate files for
// expected typescript project

// Third party libraries
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import shell from 'shelljs';

// Self information
import { tscConfig, webpackConfig, IBundlerConfig, ITscConfig } from './config';

// Constants
const CWD = process.cwd();
const PACKAGE_JSON_PATH = path.resolve(CWD, './package.json');
const TEMPLATES_PATH = path.resolve(__dirname, '../templates');

// Utils
function copyTemplatesFile(filePath: string, options: { rename?: string, sedMap?: {[key: string]: string} } = {}) {
  const {
    rename,
    sedMap,
  } = options;
  const dirPath = path.resolve(filePath, '../');
  let destFilePath = path.resolve(CWD, filePath);

  if (rename) {
    destFilePath = path.resolve(dirPath, `./${rename}`);
  }

  shell.mkdir('-p', path.resolve(CWD, dirPath));
  shell.cp(path.resolve(TEMPLATES_PATH, filePath), destFilePath);

  if (sedMap) {
    for (const sedKey in sedMap) {
      if (sedMap.hasOwnProperty(sedKey)) {
        shell.sed('-i', new RegExp(`{{${sedKey}}}`, 'g'), sedMap[sedKey], destFilePath);
      }
    }
  }
}

async function getRuntimeConfig(type: 'webpack' | 'tsc' = 'webpack') {
  switch (type) {
    case 'webpack':
      return webpackConfig;

    case 'tsc':
      return tscConfig;
  }
}

function addBundlerPackageJson(runtimeConfig: IBundlerConfig) {
  const {
    bundler,
    dependencyManager,
    libName,
    libDesc,
    author,
    license,
  } = runtimeConfig;

  switch (bundler) {
    case 'webpack':
      copyTemplatesFile('./package.json.webpack.tmpl', {
        rename: 'package.json',
        sedMap: {
          dependencyManager,
          libName,
          libDesc,
          author,
          license,
        },
      });
      break;

    default:
      throw new Error(`Invalid bundler: ${bundler}`);
  }
}

function addTscPackageJson(runtimeConfig: ITscConfig) {
  const {
    dependencyManager,
    libName,
    libDesc,
    author,
    license,
    tsCompileModule,
  } = runtimeConfig;
  const packageJsonPath = path.resolve(CWD, './package.json');
  copyTemplatesFile('./package.json.tsc.tmpl', {
    rename: 'package.json',
    sedMap: {
      dependencyManager,
      libName,
      libDesc,
      author,
      license,
    },
  });

  switch (tsCompileModule) {
    case 'commonjs':
      shell.sed('-i', '{{tscScript}}', 'tsc', packageJsonPath);
      break;

    case 'es6':
      shell.sed('-i', '{{tscScript}}', 'tsc -m es6 --outDir dist', packageJsonPath);
      break;

    default:
      throw new Error(`Invalid tsc compile module: ${tsCompileModule}`);
  }
}

/**
 * Add package.json file based on config
 */
function addPackageJson(runtimeConfig: ITscConfig | IBundlerConfig) {
  switch (runtimeConfig.compileMethod) {
    case 'bundler':
      addBundlerPackageJson(runtimeConfig);
      break;

    case 'tsc':
      addTscPackageJson(runtimeConfig);
      break;

    default:
      throw new Error('Invalid compile method');
  }
}

function addSourceCode(runtimeConfig: IBundlerConfig | ITscConfig) {
  const destEntryFileDir = path.resolve(CWD, './src');
  const destEntryFilePath = path.resolve(destEntryFileDir, `./${runtimeConfig.libName}.ts`);

  shell.mkdir('-p', destEntryFileDir);
  shell.cp(path.resolve(TEMPLATES_PATH, './src/myLib.ts.tmpl'), destEntryFilePath);
}

function addTestCodeForBundler(runtimeConfig: IBundlerConfig) {
  copyTemplatesFile('./tests/bundler.webpack.test.ts.tmpl', {
    rename: 'bundler.webpack.test.ts',
    sedMap: {
      libName: runtimeConfig.libName,
    },
  });
}

function addTestCodeForTsc(runtimeConfig: ITscConfig) {
  const {
    libName,
    dependencyManager,
  } = runtimeConfig;

  switch (runtimeConfig.tsCompileModule) {
    case 'commonjs':
      copyTemplatesFile('./tests/tsc.commonjs.test.ts.tmpl', {
        rename: 'tsc.test.ts',
        sedMap: {
          libName,
          dependencyManager,
        },
      });
      break;

    case 'es6':
      copyTemplatesFile('./tests/tsc.esm.test.ts.tmpl', {
        rename: 'tsc.test.ts',
        sedMap: {
          libName,
          dependencyManager,
        },
      });
      break;
  }
}

function addTestCode(runtimeConfig: IBundlerConfig | ITscConfig) {
  // Add test for entry file
  const {
    libName,
  } = runtimeConfig;
  const destEntryFileDir = path.resolve(CWD, './src');
  const destEntryTestFileDir = destEntryFileDir;
  const destEntryFilePath = path.resolve(destEntryFileDir, `./${libName}.ts`);
  const fromTestFileToEntryFilePath = `./${path.relative(destEntryTestFileDir, destEntryFilePath).slice(0, -3)}`;

  copyTemplatesFile('./src/myLib.test.ts.tmpl', {
    rename: `${runtimeConfig.libName}.test.ts`,
    sedMap: {
      entryFilePath: fromTestFileToEntryFilePath,
    },
  });

  // Add test for bundler or tsc
  switch (runtimeConfig.compileMethod) {
    case 'bundler':
      addTestCodeForBundler(runtimeConfig);
      break;

    case 'tsc':
      addTestCodeForTsc(runtimeConfig);
      break;
  }
}

function addBundler(runtimeConfig: IBundlerConfig) {
  const libName = runtimeConfig.libName;

  switch (runtimeConfig.bundler) {
    case 'webpack':
      copyTemplatesFile('./webpack.config.ts.tmpl', {
        rename: 'webpack.config.ts',
        sedMap: {
          libName,
          entryFilePath: `./src/${libName}.ts`,
        },
      });
      break;

    default:
      throw new Error('Invalid bundler');
  }
}

function getPackageJson() {
  return JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, {
    encoding: 'utf8',
  }));
}

function setPackageJson(packageJson: object) {
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
}

function updatePackageJson(callback: (packageJson: any) => object) {
  setPackageJson(callback(getPackageJson()));
}

//   // repository: string;
//   // compileMethod: 'bundler' | 'tsc';
//   // bundler: 'webpack'; // TODO: 'parcel' | 'browserify' | 'webpack'
//   // tsCompileModule: 'none' | 'commonjs' | 'amd' | 'system' | 'umd' | 'es2015' | 'ESNext';

async function askRuntimeConfig() {
  return inquirer
  .prompt([{
    type: 'input',
    name: 'libName',
    message: 'What\'s the name of your library?',
  }, {
    type: 'input',
    name: 'libDesc',
    message: (answers: any) => `Great! What does ${answers.libName} do?`,
  }, {
    type: 'list',
    name: 'license',
    message: 'Should we use MIT license?',
    choices: ['MIT'], // 'MIT', 'GNU', 'Apache', 'other'
    default: 'MIT',
  }, {
    type: 'confirm',
    name: 'isExecutable',
    message: (answers: any) => `Is ${answers.libName} a NodeJS executable?`,
  }, {
    type: 'list',
    name: 'dependencyManager',
    message: 'How do you want to manage code dependencies?',
    choices: ['yarn', 'npm'],
    default: 'yarn',
  }, {
    type: 'list',
    name: 'compileMethod',
    message: 'How do you want to compile your codes?',
    choices: ['bundler', 'tsc'],
    default: 'bundler',
  }, {
    type: 'list',
    name: 'bundler',
    message: 'Let\'s bundle the code! Which code bundler do you want to use?',
    choices: ['webpack'], // 'parcel' | 'browserify' | 'webpack'
    default: 'webpack',
    when: (answers: any) => answers.compileMethod === 'bundler',
  }, {
    type: 'list',
    name: 'tsCompileModule',
    message: 'Let\'s use typescirpt compiler! Which consumer you are targeting?',
    choices: ['commonjs', 'es6'], // 'parcel' | 'browserify' | 'webpack'
    default: 'commonjs',
    when: (answers: any) => answers.compileMethod === 'tsc',
  }, {
    type: 'confirm',
    name: 'hasTest',
    message: 'Should we include tests for the library?',
  }, {
    type: 'list',
    name: 'testRunner',
    message: 'Sure! Which test runner should we use?',
    choices: ['jest'], // 'jest', 'mocha'
    when: (answers: any) => !!answers.hasTest,
  }, {
    type: 'confirm',
    name: 'hasTsLint',
    message: 'Should we include tslint for the library?',
  }, {
    type: 'confirm',
    name: 'hasDemo',
    message: 'Should we include a demo directory for the library?',
  }, {
    type: 'input',
    name: 'author',
    message: 'Sounds good. Now, who are you?',
    default: 'Awesome Anonymous <awesome-anonymous@mymail.com>',
  }]);
}

async function main() {
  // const runtimeConfig = await getRuntimeConfig('tsc');
  const runtimeConfig = await askRuntimeConfig();

  console.log('runtimeConfig', runtimeConfig);
  const {
    author,
    libName,
    libDesc,
    dependencyManager,
  } = runtimeConfig;
  addPackageJson(runtimeConfig);
  addSourceCode(runtimeConfig);

  // Add tests
  if (runtimeConfig.hasTest) {
    addTestCode(runtimeConfig);
  }

  // Add bundler config files
  if (runtimeConfig.compileMethod === 'bundler') {
    addBundler(runtimeConfig);
  }

  if (runtimeConfig.hasTsLint) {
    copyTemplatesFile('./tslint.json.tmpl', {
      rename: 'tslint.json',
    });
  }

  if (runtimeConfig.hasDemo) {
    console.log('hasDemo', runtimeConfig.hasDemo);
    copyTemplatesFile('./demo/demo.ts.tmpl', {
      rename: 'demo.ts',
      sedMap: {
        libName,
      },
    });

    copyTemplatesFile('./demo/demo.test.ts.tmpl', {
      rename: 'demo.test.ts',
    });

    copyTemplatesFile('./demo/jest.config.js.tmpl', {
      rename: 'jest.config.js',
    });

    copyTemplatesFile('./demo/package.json.tmpl', {
      rename: 'package.json',
      sedMap: {
        libName,
        dependencyManager,
      },
    });

    // Update package.json test script
    shell.sed('-i', '{{testScript}}', `jest && ${dependencyManager} run demo:test`, PACKAGE_JSON_PATH);
    shell.sed('-i', '{{testCoverageScript}}',
      `jest --coverage && ${dependencyManager} run demo:test`, PACKAGE_JSON_PATH);
    updatePackageJson((packageJson) => {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['demo:test'] =
      `${dependencyManager} run build && cd demo && ` +
      `${dependencyManager} install && ${dependencyManager} run add-self && ${dependencyManager} test`;
      return packageJson;
    });
  } else {
    shell.sed('-i', '{{testScript}}', 'jest', PACKAGE_JSON_PATH);
    shell.sed('-i', '{{testCoverageScript}}', 'jest --coverage', PACKAGE_JSON_PATH);
  }

  switch (runtimeConfig.license) {
    case 'MIT':
      copyTemplatesFile('./LICENSE.mit.tmpl', {
        rename: 'LICENSE',
        sedMap: {
          author,
        },
      });
      break;
  }

  if (runtimeConfig.isExecutable) {
    updatePackageJson((packageJson) => {
      packageJson.bin = {};
      packageJson.bin[packageJson.name] = `./dist/${packageJson.name}.min.js`;
      return packageJson;
    });
  }

  copyTemplatesFile('./tsconfig.json.tmpl', {
    rename: 'tsconfig.json',
  });

  copyTemplatesFile('./.gitignore.tmpl', {
    rename: '.gitignore',
  });

  copyTemplatesFile('./.npmignore.tmpl', {
    rename: '.npmignore',
  });

  copyTemplatesFile('./.travis.yml.tmpl', {
    rename: '.travis.yml',
  });

  copyTemplatesFile('./jest.config.js.tmpl', {
    rename: 'jest.config.js',
  });

  copyTemplatesFile('./nodemon.json.tmpl', {
    rename: 'nodemon.json',
  });

  copyTemplatesFile('./README.md.tmpl', {
    rename: 'README.md',
    sedMap: {
      libName,
      libDesc,
    },
  });
}

try {
  main();
} catch (err) {
  throw new Error(err);
}
