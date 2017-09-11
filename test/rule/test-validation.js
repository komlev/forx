import is from 'is_js'
import { length, toString } from 'ramda'

const notEmpty = val => !!val,
  isNumber = val => is.number(val),
  isString = val => is.string(val),
  isArray = val => is.array(val),
  pattern = patternVal => val => patternVal.test(val),
  required = is.existy,
  minLength = len => val => length(toString(val)) >= len,
  maxLength = len => val => length(toString(val)) <= len,
  min = minVal => val => parseFloat(val) >= minVal,
  max = maxVal => val => parseFloat(val) <= maxVal

export {
  notEmpty,
  isNumber,
  isString,
  isArray,
  pattern,
  required,
  minLength,
  maxLength,
  min,
  max
}
