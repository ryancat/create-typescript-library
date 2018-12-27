import { spawn } from 'child_process';
import fs from 'fs';
import 'jest';
import path from 'path';
import shell from 'shelljs';
import { main } from './main';

const testConfigsDir = path.resolve(__dirname, './testConfigs');
const testTempDir = path.resolve(__dirname, './test-temp');

describe('create-typescript-library', () => {
  describe('configs', () => {
    fs.readdirSync(testConfigsDir).forEach((configFilePath) => {
      const configJson = JSON.parse(fs.readFileSync(path.resolve(testConfigsDir, configFilePath), {
        encoding: 'utf8',
      }));

      shell.cd(__dirname);
      shell.rm('-rf', testTempDir);
      shell.mkdir(testTempDir);
      shell.cd(testTempDir);

      const testName = path.basename(configFilePath);
      test(testName, (done) => {
        main(configJson)
        .then(() => {
          let script: string;
          switch (configJson.dependencyManager) {
            case 'yarn':
              script = 'yarn && yarn test';
              break;

            case 'npm':
              script = 'npm install && npm run test';
              break;

            default:
              throw new Error('Invalid dependency manager tool');
          }

          spawn(script, {
            shell: true,
            stdio: 'inherit',
            cwd: testTempDir,
          })
          .on('exit', (code: number) => {
            if (code > 0) {
              throw new Error(`${testName} failed with code ${code}`);
            }
            done();
          });
        });
      }, 300000); // give enough min timeout to run the bundle and test scripts
    });
  });
});
