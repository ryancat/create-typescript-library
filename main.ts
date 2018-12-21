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

async function addSourceCode() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));

  console.log('packageJson', packageJson);
  const entryFilePath = path.resolve(CWD, packageJson.main);
  const entryFileName = path.basename(entryFilePath);
  const entryFileExt = path.extname(entryFileName);
  const entryFileDir = path.resolve(entryFilePath, '../');
  const entryTestFileDir = entryFileDir;
  const destEntryFilePath = path.resolve(entryFileDir, entryFileName.replace(entryFileExt, '.ts'));
  const destEntryTestFilePath = path.resolve(entryFileDir, entryFileName.replace(entryFileExt, '.test.ts'));
  // Instead of import from 'myLib', we need to add relative path to differenciate dependent packages
  const fromTestFileToEntryFilePath = `./${path.relative(entryTestFileDir, destEntryFilePath)}`.replace('.ts', '');

  console.log('fromTestFileToEntryFilePath', `./${path.relative(entryTestFileDir, destEntryFilePath)}`);

  // Create entry file in the path given by package.json
  shell.cp(path.resolve(templatesPath, './src/myLib.ts.tmpl'), destEntryFilePath);
  shell.cp(path.resolve(templatesPath, './src/myLib.test.ts.tmpl'), destEntryTestFilePath);
  console.log(destEntryTestFilePath, destEntryFilePath);
  shell.sed('-i', '{{entryFilePath}}', fromTestFileToEntryFilePath, destEntryTestFilePath);

}

async function main() {
  await addDependencyManager();
  await addSourceCode();
}

main();
