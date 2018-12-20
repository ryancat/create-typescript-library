import { exec } from 'child_process';
import fs from 'fs';
import 'jest';
import path from 'path';
import webpack from 'webpack';
import configCallback from '../webpack.config';

const TSC_COMMONJS_PATH = path.resolve(__dirname, '../dist/commonjs/myLib.js');
const TSC_COMMONJS_SOURCEMAP_PATH = path.resolve(__dirname, '../dist/commonjs/myLib.js.map');
const TSC_ESM_PATH = path.resolve(__dirname, '../dist/esm/myLib.js');
const TSC_ESM_SOURCEMAP_PATH = path.resolve(__dirname, '../dist/esm/myLib.js.map');

describe('Bundle result', () => {

  describe('webpack bundle result', () => {
    test('should generate myLib.js and myLib.d.ts in development mode', (done) => {
      // Run webpack
      webpack(configCallback({}, { mode: 'development' }), (err, stats) => {
        // Fail test if error
        if (err) {
          throw new Error('webpack failed to run given configuration');
          done();
        }

        // Map assets to fileNames
        const fileNames: string = stats.toJson().assets.map((asset: any) => asset.name);
        expect(fileNames).toEqual(expect.arrayContaining(['myLib.js', 'myLib.d.ts']));
        done();
      });
    });

    test('should generate myLib.min.js and myLib.d.ts in production mode', (done) => {
      // Run webpack
      webpack(configCallback({}, { mode: 'production' }), (err, stats) => {
        // Fail test if error
        if (err) {
          throw new Error('webpack failed to run given configuration');
          done();
        }

        // Map assets to fileNames
        const fileNames: string = stats.toJson().assets.map((asset: any) => asset.name);
        expect(fileNames).toEqual(expect.arrayContaining(['myLib.min.js', 'myLib.d.ts']));
        done();
      });
    });
  });

  describe('tsc bundle result', () => {
    test('should generate myLib.js and myLib.js.map for commonjs modules', (done) => {
      // Run tsc in child process
      const forked = exec('npm run dev:tsc', (err, stdout, stderr) => {
        if (err) {
          throw new Error('tsc failed to run with default tsconfig');
          done();
        }

        expect(fs.existsSync(TSC_COMMONJS_PATH)).toBeTruthy();
        expect(fs.existsSync(TSC_COMMONJS_SOURCEMAP_PATH)).toBeTruthy();
        done();
      });
    }, 10000); // Need extra time to run tsc command

    test('should generate myLib.js and myLib.js.map for ES2015 modules', (done) => {
      // Run tsc in child process
      const forked = exec('npm run dev:tsc', (err, stdout, stderr) => {
        if (err) {
          throw new Error('tsc failed to run with default tsconfig and es6 module output');
          done();
        }

        expect(fs.existsSync(TSC_ESM_PATH)).toBeTruthy();
        expect(fs.existsSync(TSC_ESM_SOURCEMAP_PATH)).toBeTruthy();
        done();
      });
    }, 10000); // Need extra time to run tsc command
  });
});
