/* eslint-disable one-var, no-use-before-define */
import is from 'is_js'
import { head, tail, map, identity, length, until, add, filter } from 'ramda'
import { getPath } from './path'
import { indexMap, isIndex, isEmptyIndex, concat } from './utils'

const pathValReg = /\{([^}]+)?}/g,
  getContextKey = (key = '', index) =>
    (key && index === 0 ? key : `${key}${index}`),
  getNextContextKey = (context, key) => {
    const start = 0,
      pred = add(1),
      nextIndex = until(
        val => context[getContextKey(key, val)] === undefined,
        pred,
        start
      )

    return getContextKey(key, nextIndex)
  },
  addToCurrentPath = (context, path) => {
    let currentPath = path
    if (context.currentPath) {
      currentPath = concat(context.currentPath, currentPath)
    } else if (!is.array(currentPath)) {
      currentPath = [currentPath]
    }
    currentPath = filter(p => !isEmptyIndex(p), currentPath)
    return { ...context, currentPath }
  },
  addToCurrentIndexes = (context, key, index) => {
    const newKey = getNextContextKey(context, key),
      indexes = { ...context.indexes, [newKey]: index }
    return { ...context, indexes }
  },
  getContextPath = (inPath, contextIndexes = {}, parseInteger = true) => {
    const path = getPath(inPath)
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
      if (isIndex(result) && parseInteger) result = parseInt(result, 10)
      return result
    }, path)
  },
  getPathData = (path, value, mapFunc, context, currentKey = '') => {
    let resContext = context
    if (length(path) === 0) {
      if (!is.existy(resContext.currentPath)) resContext.currentPath = path
      resContext.reached = true
      return mapFunc(value, resContext)
    }

    let next = head(path),
      rest = tail(path)

    if (is.array(value)) {
      let fullArray = true
      if (isEmptyIndex(next)) {
        fullArray = true
        next = head(rest)
      } else if (isIndex(next)) {
        fullArray = false
      } else {
        rest = path
      }

      if (fullArray) {
        const initialContext = resContext
        return indexMap((item, i) => {
          resContext = addToCurrentPath(initialContext, i)
          resContext = addToCurrentIndexes(resContext, currentKey, i)
          return getPathData(rest, item, mapFunc, resContext, currentKey)
        }, value)
      }
    }

    let nextValue = value
    if (is.object(nextValue)) {
      resContext = addToCurrentPath(resContext, next)
      return getPathData(rest, nextValue[next], mapFunc, resContext, next)
    } else if (is.string(nextValue) && isIndex(next)) {
      resContext = addToCurrentPath(resContext, next)
      nextValue = nextValue[next]
    } else if (!is.existy(nextValue) || length(path) > 0) {
      nextValue = undefined
    }

    return mapFunc(nextValue, resContext)
  },
  queryValue = (inPath, value, mapFunc = identity) => {
    const path = getPath(inPath)
    return getPathData(path, value, mapFunc, { path, reached: false })
  }

export default queryValue
export { queryValue, getContextPath }
