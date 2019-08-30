/**
 * @copyright 2018 Zymergen
 */
import { filterData, sortData } from './filters';

describe('filterData', () => {
  test('basic single string filter', () => {
    const data = [{ a: 'cow', b: 'bob' }, { a: 'pig', b: 'alice' }, { a: 'horse', b: 'carl' }];

    const filter = { a: ['cow', 'pig'] };
    expect(filterData(data, filter).map(d => d.a)).toContain('cow');
    expect(filterData(data, filter).map(d => d.a)).not.toContain('horse');
  });

  test('multiple keyed filters', () => {
    const data = [{ a: 'cow', b: 'bob' }, { a: 'pig', b: 'alice' }, { a: 'horse', b: 'carl' }];

    const filter = { a: ['cow', 'pig'], b: ['alice'] };
    expect(filterData(data, filter).map(d => d.a)).toContain('pig');
    // now cow should not be there, as b: alice filters it out
    expect(filterData(data, filter).map(d => d.a)).not.toContain('cow');
    expect(filterData(data, filter).map(d => d.a)).not.toContain('horse');
  });

  test('filtering on array data', () => {
    const data = [
      { id: '123', a: ['cow'], b: 'bob' },
      { id: '456', a: ['pig', 'sheep'], b: 'alice' },
      { id: '789', a: ['horse'], b: 'carl' },
    ];

    const filter = { a: ['cow', 'pig'] };
    const filteredIds = filterData(data, filter).map(d => d.id);
    expect(filteredIds).toEqual(expect.arrayContaining(['123', '456']));
  });

  test('filtering on multiple array data', () => {
    const data = [
      { id: '123', a: ['cow'], b: ['bob'] },
      { id: '456', a: ['pig', 'sheep'], b: ['alice'] },
      { id: '789', a: ['horse'], b: ['carl'] },
    ];

    const filter = { a: ['cow'], b: ['bob', 'carl'] };
    let filteredIds = filterData(data, filter).map(d => d.id);
    // only 123 matches both filters
    expect(filteredIds).toEqual(expect.arrayContaining(['123']));

    // add in cow to 789's a property
    data.filter(d => d.id === '789')[0].a.push('cow');
    filteredIds = filterData(data, filter).map(d => d.id);
    // now both should be in results
    expect(filteredIds).toEqual(expect.arrayContaining(['123', '789']));
  });

  test('filtering on array data and string data', () => {
    const data = [
      { id: '123', a: ['cow'], b: 'bob' },
      { id: '456', a: ['pig', 'sheep'], b: 'alice' },
      { id: '789', a: ['horse'], b: 'carl' },
    ];

    const filter = { a: ['cow', 'horse'], b: ['bob', 'carl'] };
    const filteredIds = filterData(data, filter).map(d => d.id);
    expect(filteredIds).toEqual(expect.arrayContaining(['123', '789']));
  });

  test('filtering on mix of array and string data', () => {
    const data = [
      { id: '123', a: 'cow', b: 'bob' }, // note: a here is a string
      { id: '456', a: ['pig', 'sheep'], b: 'alice' },
      { id: '789', a: ['horse'], b: 'carl' },
    ];

    const filter = { a: ['cow', 'pig'] };
    const filteredIds = filterData(data, filter).map(d => d.id);
    expect(filteredIds).toEqual(expect.arrayContaining(['123', '456']));
  });

  test('filtering on mix of numeric array and numeric data', () => {
    const data = [
      { id: '123', a: 123, b: 234 },
      { id: '456', a: [123, 345], b: 444 },
      { id: '789', a: [567], b: 555 },
    ];

    const filter = { a: [123, 345] };
    const filteredIds = filterData(data, filter).map(d => d.id);
    expect(filteredIds).toEqual(expect.arrayContaining(['123', '456']));
  });

  test('invalid filter', () => {
    const data = [{ a: 'cow', b: 'bob' }, { a: 'pig', b: 'alice' }, { a: 'horse', b: 'carl' }];

    const filter = { a: ['cow', 'pig'], b: ['invalid'] };
    const notExpected = ['cow', 'pig', 'horse'];
    // everything is filtered when empty
    expect(filterData(data, {}, false).map(d => d.a)).not.toEqual(
      expect.arrayContaining(notExpected),
    );
    // everything is filtered when no match
    expect(filterData(data, filter).map(d => d.a)).not.toEqual(expect.arrayContaining(notExpected));
  });

  test('empty filter', () => {
    const data = [{ a: 'cow', b: 'bob' }, { a: 'pig', b: 'alice' }, { a: 'horse', b: 'carl' }];
    const expectedA = ['cow', 'pig', 'horse'];

    expect(filterData(data, null).map(d => d.a)).toEqual(expect.arrayContaining(expectedA));

    expect(filterData(data, {}).map(d => d.a)).toEqual(expect.arrayContaining(expectedA));

    // last bool removes data if no filter
    expect(filterData(data, {}, false).map(d => d.a)).not.toEqual(
      expect.arrayContaining(expectedA),
    );
  });
});

describe('sortData', () => {
  test('sort numbers', () => {
    const data = [
      { val: 12.5 },
      { val: 10001 },
      { val: 77.3 },
      { val: 6 },
      { val: 22.1 },
      { val: 10000 },
    ];

    // comparing arrays of floats seems to fail in jest.
    // so sort the data as a number, then convert to strings.
    const expected = [6, 12.5, 22.1, 77.3, 10000, 10001].map(v => v.toString());
    // convert to string to check order
    let sortedData = sortData(data, 'val').map(d => d.val.toString());
    // find index of each stringified number in the sorted data.
    let indexes = expected.map(v => sortedData.indexOf(v));
    // now indexes should be sequential, indicating the
    // order is correct.
    expect(indexes).toEqual([0, 1, 2, 3, 4, 5]);

    // reversed
    sortedData = sortData(data, 'val', 'dsc').map(d => d.val.toString());
    indexes = expected.reverse().map(v => sortedData.indexOf(v));
    expect(indexes).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test('sort strings', () => {
    const data = [
      { id: 'pecan' },
      { id: 'beta' },
      { id: 'alpha' },
      { id: 'delta' },
      { id: 'ep' },
      { id: 'alphaDos' },
    ];

    const expected = ['alpha', 'alphaDos', 'beta', 'delta', 'ep', 'pecan'];
    let sortedData = sortData(data, 'id', 'asc', false).map(d => d.id);
    let indexes = expected.map(v => sortedData.indexOf(v));
    expect(indexes).toEqual([0, 1, 2, 3, 4, 5]);

    // reversed
    sortedData = sortData(data, 'id', 'dsc', false).map(d => d.id);
    indexes = expected.reverse().map(v => sortedData.indexOf(v));
    expect(indexes).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test('invalid sortBy', () => {
    const data = [{ id: 'a' }, { id: 'c' }, { id: 'b' }];
    // keep values sorted as they are
    const expected = data.map(d => d.id);
    let sortedData = sortData(data, 'invalid', 'asc', false).map(d => d.id);
    let indexes = expected.map(v => sortedData.indexOf(v));
    expect(indexes).toEqual([0, 1, 2]);
  });
});
