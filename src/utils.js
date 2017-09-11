import is from 'is_js'
import { compose, filter, flatten, map, addIndex, all } from 'ramda'

const indexPattern = /^\d+$/,
  allAreArrays = all(is.array),
  arrayOfArrays = value => isArray(value) && allAreArrays(value),
  concat = (a = [], b = []) => Array.prototype.concat(a, b),
  isIndex = value => is.integer(value) || indexPattern.test(value),
  isEmptyIndex = value => value === '',
  parseIndex = value => (isIndex(value) ? parseInt(value, 10) : value),
  flattenFilter = compose(filter(val => is.existy(val)), flatten),
  indexMap = addIndex(map),
  doWhile = (func) => {
    let res = func()
    while (!res) {
      res = func()
    }
  }

export {
  isIndex,
  parseIndex,
  flattenFilter,
  indexMap,
  doWhile,
  isEmptyIndex,
  concat,
  arrayOfArrays
}
