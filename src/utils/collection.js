import uniq from 'lodash.uniq';
import isEmpty from 'lodash.isempty';
import isFinite from 'lodash.isfinite';
import get from 'lodash.get';
import * as d3 from 'd3';

/**
 * For a given array, return the value associated with attr from
 * the first element in the array. If the array is empty, return
 * the defaultValue.
 *
 * @param {Array} array Array of values to pick from
 * @param {String|Array} attr Attribute to select. Can also be a lodash.get style selector.
 * @param {Any} defaultValue Value to use if array is empty
 */
export function pickFirst(array, attr, defaultValue = null) {
  return array && array.length > 0 ? get(array[0], attr, defaultValue) : defaultValue;
}

/**
 * Returns the unique values of a given property of a collection.
 *   Value associated with the property can be a string,
 *   a number, or an array
 * @param  {Array} collection
 * @param  {String} propertyName
 * @return {Array} an array of unique values.
 */
export function uniqueValues(collection, propertyName) {
  if (!collection) {
    return [];
  }

  let allValues = collection.map(d => {
    if (Array.isArray(d[propertyName])) {
      return uniq(d[propertyName]);
    }
    return d[propertyName];
  });

  // if array of arrays, we need to flatten
  // one of many ways to flatten
  // http://www.jstips.co/en/javascript/flattening-multidimensional-arrays-in-javascript/
  allValues = [].concat(...allValues);

  return uniq(allValues)
    .filter(d => isFinite(d) || !isEmpty(d))
    .sort(d3.ascending);
}

/**
 * Returns true if collection includes any in list
 * @param  {Array} collection Array of values to search
 * @param  {Array} list values to check for
 * @returns {Bool} true if collection contains any
 *  of the elements in list
 */
export function includesAny(collection, list) {
  if (!collection || !list) {
    return false;
  }

  if (!Array.isArray(collection)) {
    collection = [collection];
  }

  // array.some tests whether at least one element
  // in the array passes the test
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
  return collection.some(r => list.includes(r));
}

/**
 * Returns true if collection contains
 * every value inside list
 *
 * @param {Array} collection Array to check
 * @param {Array} list Array of values collection should include
 * @returns {Boolean} true if collection contains
 * every value inside list, false otherwise.
 */
export function includesEvery(collection, list) {
  if (!collection) {
    return false;
  }

  let pass = true;

  // use for ... of to allow
  // for early break if missing
  // val is found.
  for (const val of list) {
    if (!collection.includes(val)) {
      pass = false;
      break;
    }
  }

  return pass;
}

/**
 * If value is contained in collection, remove it.
 * If value is not contained in collection, add it.
 * @param  {Array} collection
 * @param  {Any} value
 * @returns {Array} new array with value toggled
 */
export function toggleValue(collection, value) {
  // Use new Array
  let newCollection = collection ? collection.slice() : [];

  const valueIndex = newCollection.indexOf(value);

  if (valueIndex >= 0) {
    newCollection.splice(valueIndex, 1);
  } else {
    newCollection.push(value);
  }

  return newCollection;
}

/**
 * Creates a new array with all the values of collection in it and all the values of newValues in it.
 * Duplicate values are not added.
 * Values are extracted from newItems using the provided accessorFunc to add to collection.
 *
 * @param {Array} collection Array simple values.
 * @param {Array} newItems Array of Objects.
 * @param {Function} accessorFunc Used to determine if a
 * @returns {Array} Array containing the union of collection and values extracted from newItems via accessorFunc.
 */
export function addIfMissing(collection, newItems, accessorFunc = d => d.key) {
  if (!collection) {
    collection = [];
  }
  const newCollection = collection.slice();

  newItems.forEach(d => {
    if (!newCollection.includes(accessorFunc(d))) {
      newCollection.push(accessorFunc(d));
    }
  });

  return newCollection;
}

/**
 * Orders a set of categorical values so that None goes last.
 * @param {Array} categories
 * @returns {Array} sorted categories
 */
export function orderCategories(categories) {
  return categories.sort((a, b) => {
    if (a === 'None') {
      return 1;
    }

    if (b === 'None') {
      return -1;
    }

    return d3.ascending(a, b);
  });
}

/**
 * Turns array inside out to create a object of objects with
 * each inner object containing all the values
 * [
 *  {id: 1, a: true},
 *  {id: 2, a: false, b:true}
 * ]
 * into
 * {a: {1: {id: 1, a: true}, b: {2: {id: 1, b: true, a: false}}}
 * @param {Array} collection
 */
export function invert(collection, accessor = d => d.id) {
  const inverted = {};
  const boolValues = d3.set();
  collection.forEach(entry => {
    Object.keys(entry).forEach(k => boolValues.add(k));
  });

  boolValues.each(key => {
    const filteredValues = collection.filter(entry => entry[key]);
    const keyedValues = {};
    filteredValues.forEach(v => (keyedValues[accessor(v)] = v));

    inverted[key] = keyedValues;
  });

  return inverted;
}

/**
 * concats together an array of arrays
 * @param {Array} arrays Array of arrays
 */
export function concatArrays(arrays) {
  return [].concat.apply([], arrays);
}

/**
 * Merges two arrays by a shared id
 * could use https://github.com/ZitRos/array-merge-by-key
 * if that would be better.
 */
export function joinById(id, arrayA, arrayB) {
  const arrayBMap = d3.map(arrayB, d => d[id]);

  const mergedData = [];

  arrayA.forEach(row => {
    let mergedRow = {};
    if (arrayBMap.has(row[id])) {
      mergedRow = Object.assign({}, row, arrayBMap.get(row[id]));
    } else {
      mergedRow = Object.assign({}, row);
    }

    mergedData.push(mergedRow);
  });

  return mergedData;
}

/**
 * Adds contents from an object to an array of objects based on
 * input key.
 *
 * @param {Array} arrayOfObjects An Array of objects to modify
 * @param {Object} dict Object that serves as a dictionary to
 *   pull out additional info to append to objects in the
 *   arrayOfObjects array.
 * @param {String} key Key to match objects in arrayOfObjects and
 *   keys of dict by.
 * @param {String} path Path in objects of arrayOfObjects to
 *   put the new contents from dict in to.
 * @returns {Array} arrayOfObjects with new additions to each
 *   object from the values of dict.
 */
export function addByKey(arrayOfObjects, dict, key = 'key', newPath = 'details') {
  arrayOfObjects.forEach(obj => {
    // find new content for obj from its key
    const newContent = dict[obj[key]];
    if (newContent) {
      obj[newPath] = newContent;
    }
  });

  return arrayOfObjects;
}

/**
 * Returns powerset of an array of values
 * derived from: https://stackoverflow.com/questions/42773836/how-to-find-all-subsets-of-a-set-in-javascript
 * @param {Array} values Array of values
 */
export function powerSet(values) {
  const pSet = values.reduce(
    (subsets, value) => {
      return subsets.concat(subsets.map(set => [value, ...set]));
    },
    [[]],
  );
  // sort all sets by name - for consistency
  pSet.forEach(s => s.sort(d3.ascending));
  // sort by length
  pSet.sort((a, b) => a.length - b.length);

  return pSet;
}
