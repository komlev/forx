import is from 'is_js'
import { apply, reduce, map, T, always, filter, compose, toPairs } from 'ramda'
import { concat, arrayOfArrays } from './utils'
import { getPath } from './path'
import { queryValue, getContextPath } from './query'
import { validateItem } from './validation'

const defaultEnabler = [T],
  normalizeParams = (params) => {
    let result = params
    if (is.function(result)) return normalizeParams(result())
    if (!is.existy(result)) return result
    if (!is.array(result)) result = [result]
    return map((p) => {
      if (is.function(p)) return p
      return getPath(p)
    }, result)
  },
  normalizeTest = (value) => {
    if (is.function(value)) return normalizeTest(value())
    if (!is.existy(value) || !is.array(value)) return value
    if (!arrayOfArrays(value)) return [value]
    return value
  },
  mapEnablers = compose(
    map((v) => {
      if (!is.function(v)) return always(v)
      return v
    }),
    filter(is.existy)
  ),
  normalizeEnabled = (value) => {
    if (!is.existy(value)) return defaultEnabler
    if (is.function(value)) return [value]
    if (is.array(value)) return mapEnablers(value)
    return value
  },
  normalizeRule = (rule) => {
    if (!is.existy(rule) || is.function(rule)) return rule
    const value = getPath(rule.value),
      test = normalizeTest(rule.test),
      params = normalizeParams(rule.params),
      enabled = normalizeEnabled(rule.enabled)

    return { ...rule, value, test, params, enabled }
  },
  normalizeRules = map(normalizeRule),
  queryParam = (params, value, context) =>
    map((p) => {
      if (is.function(p)) return p()
      return queryValue(getContextPath(p, context.indexes), value)
    }, params),
  getRuleParams = (value, queryRes, params, context) => {
    let result = [queryRes]
    if (params) {
      result = concat(result, queryParam(params, value, context), context)
    } else {
      result = concat(result, context)
    }

    return result
  },
  isEnabled = (params, predicated) =>
    reduce(
      (acc, f) => {
        if (f && is.function(f)) return acc && apply(f, params)
        return acc
      },
      true,
      predicated
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
  validateToObject = (rule, value) => (val, context) => {
    const toArray = validateToArray(rule, value)
    return toArray
  },
  runRule = (inRule, value, mapFunction = validateToArray) => {
    const rule = normalizeRule(inRule)
    return queryValue(rule.value, value, mapFunction(rule, value))
  },
  runRules = (rules, value, toObject = false) => {
    const mapFunc = toObject ? validateToObject : validateToArray
    return map(r => runRule(r, value, mapFunc), rules)
  },
  makeListConfig = map(normalizeRule),
  makeObjectConfig = compose(makeListConfig, map(createRule), toPairs),
  makeConfig = (config) => {
    if (is.array(config)) return makeListConfig(config)
    if (is.object(config)) return makeObjectConfig(config)
    return config
  }

export default runRule
export { runRule, normalizeRule, normalizeRules, makeConfig, runRules }
