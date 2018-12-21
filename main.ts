// The nodejs executable for generating typescript library
// The program is working off a config given by consumer. From the config,
// the program will composite corresponding components and generate files for
// expected typescript project

// Third party libraries
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

// Self information
import { config } from './config';
// import { version } from './package.json';

// Constants
const CWD = process.cwd();
const packageJsonPath = path.resolve(CWD, './package.json');
const templatesPath = path.resolve(__dirname, '../templates');

const runtimeState = {
  get packageJson() {
    return JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
  },

  get destEntryFilePath() {
    const entryFilePath = path.resolve(CWD, this.packageJson.main);
    const entryFileName = path.basename(entryFilePath);
    const entryFileExt = path.extname(entryFileName);
    const entryFileDir = path.resolve(entryFilePath, '../');
    return path.resolve(entryFileDir, entryFileName.replace(entryFileExt, '.ts'));
  },
};

// Receive argv

// hasDemo: boolean;
//   hasTest: boolean;
//   hasTsLint: boolean;
// bundler: 'webpack'; // TODO: 'parcel' | 'browserify' | 'webpack'
//   dependencyManager: 'yarn'; // TODO: 'npm' | 'yarn'
//   outputUmdBundle: boolean;
//   outputEs6Module: boolean;
//   outputCommonJsModule: boolean;

// From config, we need to pick templates to composite the targetting project

/**
 * Add package.json file
 */
async function addDependencyManager() {
  return new Promise((resolve, reject) => {
    switch (config.dependencyManager) {
      case 'yarn':
        spawn('yarn init', {
          stdio: 'inherit',
          shell: true,
        })
        // For normal close of child process
        .on('close', (code) => {
          if (code > 0) {
            // Error case
            reject(code);
          }

          resolve(code);
        })
        // For control-c terminate
        .on('SIGINT', () => {
          console.log('Terminate setup for now. Bye!');
          process.exit();
        });
        break;

      default:
        throw new Error(`Invalid depenencyManager: ${config.dependencyManager}`);
    }
  });
}

function addSourceCode() {
  const destEntryFilePath = runtimeState.destEntryFilePath;
  const destEntryFileDir = path.resolve(destEntryFilePath, '../');
  const destEntryTestFileDir = destEntryFileDir;
  const destEntryFileName = path.basename(destEntryFilePath);
  const destEntryTestFilePath = path.resolve(destEntryFileDir, `${destEntryFileName.slice(0, -3)}.test.ts`);
  const fromTestFileToEntryFilePath = `./${path.relative(destEntryTestFileDir, destEntryFilePath).slice(0, -3)}`;

  // Create entry file and test file in the path given by package.json
  shell.mkdir('-p', destEntryFileDir);
  shell.cp(path.resolve(templatesPath, './src/myLib.ts.tmpl'), destEntryFilePath);
  shell.mkdir('-p', destEntryTestFileDir);
  shell.cp(path.resolve(templatesPath, './src/myLib.test.ts.tmpl'), destEntryTestFilePath);
  shell.sed('-i', '{{entryFilePath}}', fromTestFileToEntryFilePath, destEntryTestFilePath);
}

function addBundler() {
  const packageJson = runtimeState.packageJson;
  const libName = packageJson.name;
  const destEntryFilePath = runtimeState.destEntryFilePath;

  switch (config.bundler) {
    case 'webpack':
      const webpackConfigPath = path.resolve(CWD, './webpack.config.ts');
      shell.cp(path.resolve(templatesPath, './webpack.config.ts.tmpl'), webpackConfigPath);
      shell.sed('-i', '{{libName}}', libName, webpackConfigPath);
      shell.sed('-i', '{{entryFilePath}}', `./${path.relative(CWD, destEntryFilePath)}`, webpackConfigPath);
      break;

    default:
      throw new Error(`Invalid bundler: ${config.bundler}`);
  }
}

async function main() {
  await addDependencyManager();
  addSourceCode();
  addBundler();
}

main();
