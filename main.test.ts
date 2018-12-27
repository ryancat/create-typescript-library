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

      test(path.basename(configFilePath), (done) => {
        main(configJson)
        .then(() => {
          spawn('yarn && yarn test', {
            shell: true,
            stdio: 'inherit',
            cwd: testTempDir,
          })
          .on('exit', (code: number) => {
            if (code > 0) {
              throw new Error(`jest test failed with code ${code}`);
            }
            done();
          });
        });
      }, 180000);
    });
  });
});
