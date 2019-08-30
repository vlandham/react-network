import { removeEmptyKeys, arrayToObject } from './object';

describe('removeEmptyKeys', () => {
  test('basic one level remove', () => {
    const obj = { a: [], b: null, c: 'hello', d: undefined, e: 0, f: { a: true }, g: {} };
    const emptiedObj = removeEmptyKeys(obj);
    // keep these
    expect(Object.keys(emptiedObj)).toContain('a');
    expect(Object.keys(emptiedObj)).toContain('c');
    expect(Object.keys(emptiedObj)).toContain('e');
    expect(Object.keys(emptiedObj)).toContain('f');

    // remove these
    expect(Object.keys(emptiedObj)).not.toContain('b');
    expect(Object.keys(emptiedObj)).not.toContain('d');
    expect(Object.keys(emptiedObj)).not.toContain('g');
    // doesn't affect original object
    expect(Object.keys(obj)).toContain('b');
    expect(Object.keys(obj)).toContain('d');
  });

  test('nested object', () => {
    const obj = {
      a: {},
      b: {
        a: null,
        c: 'hello',
      },
      d: {
        e: 'ahh',
        f: 'real monsters',
        g: {},
      },
    };

    const emptiedObj = removeEmptyKeys(obj);

    expect(Object.keys(emptiedObj)).toContain('b');
    expect(Object.keys(emptiedObj.b)).toContain('c');
    expect(Object.keys(emptiedObj.b)).not.toContain('a');

    expect(Object.keys(emptiedObj)).toContain('d');
    expect(Object.keys(emptiedObj.d)).toContain('e');
    expect(Object.keys(emptiedObj.d)).toContain('f');
    expect(Object.keys(emptiedObj.d)).not.toContain('g');
  });
});

describe('arrayToObject', () => {
  test('basic arrays of objects', () => {
    const array = [
      { param1: 'a', param2: 123 },
      { param1: 'b', param2: 345 },
      { param1: 'c', param2: 567 },
    ];
    expect(Object.keys(arrayToObject(array, 'param1'))).toEqual(['a', 'b', 'c']);
    expect(Object.keys(arrayToObject(array, 'param2'))).toEqual(['123', '345', '567']);
    // invalid keyBy
    expect(Object.keys(arrayToObject(array, 'param3'))).toEqual([]);

    // no array
    expect(Object.keys(arrayToObject(null, 'param1'))).toEqual([]);
    expect(Object.keys(arrayToObject([], 'param1'))).toEqual([]);
  });
});
