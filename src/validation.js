import {
  map,
  compose,
  filter,
  identity,
  isFunction,
  isBoolean
} from 'lodash/fp'
import { isExisty } from './assert'

const Success = value => ({ value, type: 'Success' }),
  Failure = value => ({ value, type: 'Failure' }),
  matchWith = rule => v => rule[v.type](v.value),
  empty = () => null,
  createRule = (rule) => {
    const [test, message] = rule
    return (...rest) => {
      let resMessage = message
      const result = test(...rest)
      if (!isBoolean(result) && isExisty(result)) resMessage = result
      if (result === true) return Success(rest[0])
      if (isFunction(resMessage)) return Failure(resMessage(...rest))
      return Failure(resMessage)
    }
  },
  createRules = map(createRule),
  runRules = ([input, test]) => map(rule => rule(...input), createRules(test)),
  getError = matchWith({ Success: empty, Failure: identity }),
  getSuccess = matchWith({ Success: identity, Failure: empty }),
  filterErrors = filter(getError),
  filterSuccess = filter(getSuccess),
  validateItem = compose(filterErrors, runRules),
  validate = map(validateItem)

export {
  createRule,
  createRules,
  runRules,
  filterErrors,
  filterSuccess,
  validateItem,
  validate
}
