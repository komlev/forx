import { getPath } from 'q3000' // eslint-disable-line
import { isArray, map, all } from 'lodash/fp'

const allAreArrays = all(isArray),
  arrayOfArrays = value => isArray(value) && allAreArrays(value),
  concat = (a = [], b = []) => Array.prototype.concat(a, b),
  pathValReg = /\{([^}]+)?}/g,
  until = (pred, transform, initial) => {
    let res = initial
    while (!pred(res)) res = transform(res)
    return res
  },
  getContextPath = (inPath, contextIndexes = {}) => {
    if (!inPath) return inPath
    return map((p) => {
      let match = true,
        index = 0,
        result = ''
      const check = () => !match,
        append = (val) => {
          match = pathValReg.exec(p)
          if (!match) return val
          const variable = contextIndexes[match[1]],
            res = val + p.slice(index, match.index) + variable
          index = match.index + match[0].length
          return res
        }
      result = until(check, append, '') + p.substr(index, p.length - index)
      return result
    }, getPath(inPath))
  }

export { concat, arrayOfArrays, getContextPath }
