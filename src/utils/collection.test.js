import {
  pickFirst,
  uniqueValues,
  includesAny,
  includesEvery,
  toggleValue,
  orderCategories,
  concatArrays,
  addByKey,
  powerSet,
  addIfMissing,
} from './collection';

describe('pickFirst', () => {
  test('no default value', () => {
    const array = [{ a: 'one' }, { a: 'two' }];

    expect(pickFirst(array, 'a')).toBe('one');
    expect(pickFirst(array, 'b')).toBeNull();
  });

  test('default value', () => {
    expect(pickFirst([], 'a', 'one')).toBe('one');
    expect(pickFirst(null, 'b', 'one')).toBe('one');
  });
});

describe('uniqueValues', () => {
  test('empty array', () => {
    expect(uniqueValues([], 'a').length).toBe(0);
    expect(uniqueValues(undefined, 'a').length).toBe(0);
    expect(uniqueValues(null, 'a').length).toBe(0);
  });

  test('find unique values for strings', () => {
    const array = [
      { a: 'one' },
      { a: 'two' },
      { a: 'two' },
      { a: 'one' },
      { a: 'three' },
      { a: 'three' },
      { a: 'three' },
      { a: 'one' },
    ];
    const expected = ['one', 'two', 'three'];
    expect(uniqueValues(array, 'a')).toEqual(expect.arrayContaining(expected));
  });

  test('find unique values for numbers', () => {
    const array = [{ a: 1 }, { a: 2 }, { a: 2 }, { a: 1 }, { a: 3 }, { a: 3 }, { a: -1 }, { a: 0 }];
    const expected = [-1, 0, 2, 3];
    expect(uniqueValues(array, 'a')).toEqual(expect.arrayContaining(expected));
  });

  test('find unique values for arrays of numbers', () => {
    const array = [
      { a: [1] },
      { a: [2, 2] },
      { a: [2] },
      { a: [1, 2] },
      { a: [1, 3] },
      { a: 3 },
      { a: [-1] },
      { a: 0 },
    ];
    const expected = [-1, 0, 2, 3];
    expect(uniqueValues(array, 'a')).toEqual(expect.arrayContaining(expected));
  });
});

describe('includesAny', () => {
  test('test list', () => {
    const array = ['one', 'two', 'three'];
    const present = ['one'];
    const notPresent = ['false'];
    expect(includesAny(array, present)).toBeTruthy();
    expect(includesAny(array, notPresent)).toBeFalsy();
  });

  test('empty list', () => {
    const array = ['one', 'two', 'three'];
    expect(includesAny(array, [])).toBeFalsy();
    expect(includesAny(array, false)).toBeFalsy();
    expect(includesAny(array, null)).toBeFalsy();
  });

  test('empty array', () => {
    const array = [];
    const list = ['one'];
    expect(includesAny(array, list)).toBeFalsy();
    expect(includesAny(false, list)).toBeFalsy();
    expect(includesAny(undefined, list)).toBeFalsy();
  });

  test('collection not a collection', () => {
    const list = ['one', 2];
    expect(includesAny('one', list)).toBeTruthy();
    expect(includesAny('two', list)).toBeFalsy();
    expect(includesAny(1, list)).toBeFalsy();
    expect(includesAny(2, list)).toBeTruthy();
  });
});

describe('includesEvery', () => {
  test('valid lists', () => {
    const array = ['one', 'two', 'three'];
    const present1 = ['one'];
    const present2 = ['one', 'two'];
    const present3 = ['one', 'two', 'three'];

    expect(includesEvery(array, present1)).toBeTruthy();
    expect(includesEvery(array, present2)).toBeTruthy();
    expect(includesEvery(array, present3)).toBeTruthy();
  });

  test('invalid lists', () => {
    const array = ['one', 'two', 'three'];
    const invalid1 = ['on'];
    const invalid2 = ['one', 'twoff'];
    const invalid3 = ['one', 'two', 'tree'];
    const invalid4 = ['one', 'two', 'three', 'four'];

    expect(includesEvery(array, invalid1)).toBeFalsy();
    expect(includesEvery(array, invalid2)).toBeFalsy();
    expect(includesEvery(array, invalid3)).toBeFalsy();
    expect(includesEvery(array, invalid4)).toBeFalsy();
  });

  test('empty list', () => {
    const array = ['one', 'two', 'three'];
    expect(includesEvery(array, [])).toBeTruthy();
  });

  test('empty array', () => {
    const array = [];
    const list = ['one'];
    expect(includesAny(array, list)).toBeFalsy();
    expect(includesAny(false, list)).toBeFalsy();
    expect(includesAny(undefined, list)).toBeFalsy();
  });
});

describe('toggleValue', () => {
  test('toggle category value on / off', () => {
    const array = ['one', 'two', 'three'];
    // toggle on
    expect(toggleValue(array, 'four')).toContain('four');
    // toggle off
    expect(toggleValue(array, 'three')).not.toContain('three');
    // original array unaffected
    expect(array).toContain('three');
  });

  test('toggle number value on / off', () => {
    const array = [3, 2, 1];
    // toggle on
    expect(toggleValue(array, 4)).toContain(4);
    // toggle off
    expect(toggleValue(array, 3)).not.toContain(3);
    // original array unaffected
    expect(array).toContain(3);
  });

  test('empty array', () => {
    expect(toggleValue([], 'one')).toContain('one');
    expect(toggleValue(null, 'one')).toContain('one');
    expect(toggleValue(undefined, 'one')).toContain('one');
  });
});

describe('addIfMissing', () => {
  test('add items to collection', () => {
    const collection = [1, 2, 4];
    const newObjs = [{ a: 3 }, { a: 4 }, { b: 3 }];
    const newCollection = addIfMissing(collection, newObjs, d => d.a);
    expect(newCollection).toEqual(expect.arrayContaining([1, 2, 3, 4]));
  });
  test('start with empty collection', () => {
    const collection = [];
    const newObjs = [{ a: 3 }, { a: 4 }, { b: 3 }];
    let newCollection = addIfMissing(collection, newObjs, d => d.a);
    expect(newCollection).toEqual(expect.arrayContaining([3, 4]));
    newCollection = addIfMissing(null, newObjs, d => d.a);
    expect(newCollection).toEqual(expect.arrayContaining([3, 4]));
  });
});

describe('orderCategories', () => {
  test('sort correctly without None', () => {
    const array = ['c', 'b', 'a'];
    const expected = ['a', 'b', 'c'];
    expect(orderCategories(array)).toEqual(expect.arrayContaining(expected));
  });

  test('sort correctly with None', () => {
    const array = ['c', 'None', 'b', 'a'];
    const expected = ['a', 'b', 'c', 'None'];
    expect(orderCategories(array)).toEqual(expect.arrayContaining(expected));
  });
});

describe('concatArrays', () => {
  test('combine multiple arrays', () => {
    const arrays = [[1, 2], [3, 4], [5, 6], []];
    const expected = [1, 2, 3, 4, 5, 6];
    expect(concatArrays(arrays)).toEqual(expect.arrayContaining(expected));
  });

  test('combine multiple string arrays', () => {
    const arrays = [['a', 'b'], ['c', 'd']];
    const expected = ['a', 'b', 'c', 'd'];
    expect(concatArrays(arrays)).toEqual(expect.arrayContaining(expected));
  });

  test('collapse duplicate values', () => {
    const arrays = [['a', 'b'], ['a', 'b']];
    const expected = ['a', 'b'];
    expect(concatArrays(arrays)).toEqual(expect.arrayContaining(expected));
  });
});

describe('addByKey', () => {
  test('add summaries to strains', () => {
    const strains = [{ key: '123' }, { key: 'zzz' }, { key: '345' }];

    const summaries = {
      '123': { id: 'a' },
      '345': { id: 'b' },
    };

    const combined = addByKey(strains, summaries, 'key', 'summary');
    // doesn't affect strains length
    expect(combined.length).toBe(3);

    // summary is attached to subset of strains
    expect(strains[0].summary).toBeTruthy();
    expect(strains[1].summary).toBeFalsy();
    expect(strains[2].summary).toBeTruthy();

    expect(strains[0].summary).toEqual(expect.objectContaining({ id: 'a' }));
    expect(strains[2].summary).toEqual(expect.objectContaining({ id: 'b' }));
  });
});

describe('powerSet', () => {
  test('generate powerset for strings', () => {
    const set = ['a', 'b', 'c'];
    const pSet = powerSet(set);

    const expectedPSet = [
      [],
      ['a'],
      ['b'],
      ['c'],
      ['a', 'b'],
      ['b', 'c'],
      ['a', 'c'],
      ['a', 'b', 'c'],
    ];
    expect(pSet.length).toBe(8);
    expect(pSet[pSet.length - 1]).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    expect(pSet[0]).toEqual(expect.arrayContaining([]));
    expect(pSet).toEqual(expect.arrayContaining(expectedPSet));
  });

  test('generate powerset for numbers', () => {
    const set = [1, 2, 3, 4, 5];
    const pSet = powerSet(set);
    expect(pSet.length).toBe(32);
    expect(pSet[pSet.length - 1]).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    expect(pSet[0]).toEqual(expect.arrayContaining([]));
  });

  test('empty set', () => {
    const set = [];
    const pSet = powerSet(set);
    expect(pSet.length).toBe(1);
    expect(pSet[0]).toEqual(expect.arrayContaining([]));
  });
});
