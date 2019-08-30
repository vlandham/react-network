/**
 * @copyright 2018 Zymergen
 */
import { ascending, descending } from 'd3';

import { includesAny } from './collection';

/**
 * Filters data array based on filters object.
 * Each key in the filters object indicates an attribute
 * in data to filter on. Each value in the filters object
 * is an array of allowed values for that attribute.
 *
 * If multiple values exist in a filter value array,
 * data elements matching any of the values are retained.
 *
 * If there are multiple keys in the filter object,
 * only data elements that have matching values for all
 * keys are retained.
 *
 * @param {Array} data Data to be filtered
 * @param {Object} filters key = filter value = Array of allowed values
 * @param {Boolean} keepIfNoFilters if true, returns unfiltered data
 *   if empty filters object {} provided.
 * @returns {Array} Filtered data
 */
export function filterData(data, filters, keepIfNoFilters = true) {
  // if there is no filters object, or filters has no keys,
  // early exit.
  if (!filters || Object.keys(filters).length === 0) {
    if (keepIfNoFilters) {
      return data;
    } else {
      return [];
    }
  }

  return data.filter(row => {
    let keep = true;

    Object.keys(filters).forEach(key => {
      const rowValue = row[key];
      const filterValue = filters[key].map(f => f.toString());

      if (!rowValue) {
        keep = false;
      }

      if (Array.isArray(rowValue)) {
        const rowStrings = rowValue.map(r => r.toString());
        keep = keep && includesAny(rowStrings, filterValue);
      } else {
        keep = keep && filterValue.includes(rowValue.toString());
      }
    });
    return keep;
  });
}

/**
 * Sorts array of data based on the value of the sortBy attribute.
 * WARNING: sort is currently done in place.
 *
 * @param {Array} data Array of Objects to sort
 * @param {String} sortBy Attribute to sort data by
 * @param {String} direction either 'asc' or 'dsc'
 * @param {Boolean} isNum True if the values of the sortBy are numbers
 */
export function sortData(data, sortBy, direction = 'asc', isNum = true) {
  if (sortBy) {
    data.sort((a, b) => {
      const aValue = isNum ? +a[sortBy] : a[sortBy];
      const bValue = isNum ? +b[sortBy] : b[sortBy];
      if (direction === 'asc') {
        return ascending(aValue, bValue);
      } else {
        return descending(aValue, bValue);
      }
    });
  }

  return data;
}
