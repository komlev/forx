import { getPath, traverse, set } from 'q3000' // eslint-disable-line
import {
  reduce,
  map,
  filter,
  compose,
  always,
  toPairs,
  isFunction,
  isArray,
  isObject,
  isEmpty,
  forEach,
  last,
  slice,
  cloneDeep
} from 'lodash/fp'
import { isExisty } from './assert'
import { concat, arrayOfArrays, getContextPath } from './utils'
import { validateItem } from './validation'

const defaultEnabler = [() => true],
  normalizeParams = (params) => {
    let result = params
    if (isFunction(result)) return normalizeParams(result())
    if (!isExisty(result)) return result
    if (!isArray(result)) result = [result]
    return map((p) => {
      if (isFunction(p)) return p
      return getPath(p)
    }, result)
  },
  normalizeTest = (value) => {
    if (isFunction(value)) return normalizeTest(value())
    if (!isExisty(value) || !isArray(value)) return value
    if (!arrayOfArrays(value)) return [value]
    return value
  },
  mapEnablers = compose(
    map((v) => {
      if (!isFunction(v)) return always(v)
      return v
    }),
    filter(isExisty)
  ),
  normalizeEnabled = (value) => {
    if (!isExisty(value)) return defaultEnabler
    if (isFunction(value)) return [value]
    if (isArray(value)) return mapEnablers(value)
    return value
  },
  normalizeRule = (rule) => {
    if (!isExisty(rule) || isFunction(rule)) return rule
    const value = getPath(rule.value),
      test = normalizeTest(rule.test),
      params = normalizeParams(rule.params),
      enabled = normalizeEnabled(rule.enabled)

    return { ...rule, value, test, params, enabled }
  },
  queryPath = (value, context) => (p) => {
    if (isFunction(p)) {
      // clone to prevent anyone from messing with lib internals
      return p(cloneDeep({
        current: context.current,
        indexes: context.indexes
      }))
    }
    const
      contextPath = getContextPath(p, context.indexes)

    if (last(contextPath) === '@') {
      return slice(0, contextPath.length - 1, contextPath)
    }
    return traverse(contextPath, value)
  },
  queryPaths = (params, value, context) =>
    map(queryPath(value, context), params),
  getRuleParams = (value, queryRes, params, context) => {
    let result = [queryRes]
    if (params) {
      result = concat(result, queryPaths(params, value, context), context)
    } else {
      result = concat(result, context)
    }

    return result
  },
  isEnabled = (params, predicats) =>
    reduce(
      (acc, f) => {
        if (f && isFunction(f)) return acc && f(...params)
        return acc
      },
      true,
      predicats
    ),
  createRule = (value, test, params, enabled) => ({
    value,
    test,
    params,
    enabled
  }),
  validateToArray = (rule, value) => (val, context) => {
    const ruleParams = getRuleParams(value, val, rule.params, context)
    if (!isEnabled(ruleParams, rule.enabled)) return []
    return map(r => r.value, validateItem([ruleParams, rule.test]))
  },
  runRule = (rule, value, mapFunction = validateToArray) =>
    traverse(rule.value, value, mapFunction(rule, value)),
  runRaw = (rules, value) =>
    map(r => runRule(r, value, validateToArray), rules),
  run = (rules, inValue) => {
    let res = {}
    const mapFunction = (rule, value) => (val, context) => {
      const ruleParams = getRuleParams(value, val, rule.params, context),
        resPath =
          (rule.to && getContextPath(rule.to, context.indexes)) || context.goal
      if (!isEnabled(ruleParams, rule.enabled)) return []
      // eslint-disable-next-line one-var
      const errors = map(r => r.value, validateItem([ruleParams, rule.test]))
      if (!isEmpty(errors)) res = set(resPath, errors, res)
      return null
    }
    forEach(r => runRule(r, inValue, mapFunction), rules)
    return res
  },
  makeListConfig = map(normalizeRule),
  makeObjectConfig = compose(makeListConfig, map(createRule), toPairs),
  makeConfig = (config) => {
    if (isArray(config)) return makeListConfig(config)
    if (isObject(config)) return makeObjectConfig(config)
    return config
  }

export default runRule
export { runRule, normalizeRule, makeConfig, runRaw, run }
