import { array2Map } from '../helpers';

describe('helpers', () => {
  test('array2Map', () => {
    const arr = [
      'files/a/.size.json',
      'files/b/.size.json',
      'files/a/test.txt',
    ];
    expect(array2Map(arr)).toEqual({
      [arr[0]]: true,
      [arr[1]]: true,
      [arr[2]]: true,
    });
  });
});
