import isEmpty from 'lodash.isempty';

/**
 * Removes keys from an object that are empty.
 *
 * Returns a new empty. Will only go one level deep into objects
 * @param  {Object} obj input object
 * @return {Object}
 */
export function removeEmptyKeys(obj) {
  const res = {};
  const keys = Object.keys(obj);
  keys.forEach(key => {
    const prop = obj[key];
    if (typeof prop === 'object' && !Array.isArray(prop) && prop !== null) {
      const temp = removeEmptyKeys(prop);
      if (!isEmpty(temp)) {
        res[key] = temp;
      }
    } else if (!(prop === undefined || prop === null)) {
      res[key] = prop;
    }
  });

  return res;
}

/**
 * Convert Array of objects into an object keyed by
 * keyField.
 * @param {Array} array Array to convert to object
 * @param {String} keyField Attribute of array's objects to use as key
 * @return {Object} Object keyed by keyField values.
 */
export function arrayToObject(array, keyField) {
  if (!array) {
    return {};
  }

  return array.reduce((obj, item) => {
    if (item[keyField]) {
      obj[item[keyField]] = item;
    }
    return obj;
  }, {});
}
