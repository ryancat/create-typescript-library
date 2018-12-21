import 'jest';
import { myLib } from 'myLib';

describe('myLib', () => {
  test('can add two numbers', () => {
    expect(myLib.add(1, 2)).toBe(3);
  });
});
