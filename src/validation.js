import { Success, Failure } from 'folktale/validation'
import {
  map,
  compose,
  filter,
  identity,
  apply,
  isFunction,
  isBoolean
} from 'lodash/fp'
import { isExisty } from './assert'

const empty = () => null,
  matchError = { Success: empty, Failure: identity },
  matchSuccess = { Success: identity, Failure: empty },
  createRule = (rule) => {
    const [test, message] = rule
    return (...rest) => {
      let resMessage = message
      const result = apply(test)(rest)
      if (!isBoolean(result) && isExisty(result)) resMessage = result
      if (result === true) return Success(rest[0])
      if (isFunction(resMessage)) return Failure(apply(resMessage)(rest))
      return Failure(resMessage)
    }
  },
  createRules = map(createRule),
  runRules = ([input, test]) =>
    map(rule => apply(rule)(input), createRules(test)),
  getError = i => i.matchWith(matchError),
  getSuccess = i => i.matchWith(matchSuccess),
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
