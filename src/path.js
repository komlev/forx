import is from 'is_js'
import { map, split, partialRight, compose, lensPath, all } from 'ramda'
import { isIndex, parseIndex, flattenFilter } from './utils'

const pathSplit = split('.'),
  isPathItemValid = (p) => {
    let result = is.string(p) && p.indexOf('.') === -1
    if (isIndex(p)) result = result && is.integer(p)
    return result
  },
  areAllItemsValid = all(isPathItemValid),
  isPath = path => is.array(path) && areAllItemsValid(path),
  mapIndexes = map((d) => {
    if (isIndex(d)) return parseIndex(d)
    return d
  }),
  getPath = (path, parseInteger = true) => {
    if (isPath(path)) return path
    let result = path
    if (is.function(result)) {
      result = getPath(result(), parseInteger)
    }
    if (!is.existy(result)) return result
    if (is.array(result)) {
      result = map(partialRight(getPath, [parseInteger]), result)
    }
    if (is.string(result)) {
      result = pathSplit(result)
      if (parseInteger && result) result = mapIndexes(result)
    }
    if (is.integer(result)) result = [result]
    return flattenFilter(result)
  },
  toLens = lensPath,
  getLens = compose(toLens, getPath)

export default getPath
export { getPath, toLens, getLens, isPath }
