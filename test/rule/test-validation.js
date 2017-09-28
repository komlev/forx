import { toString, isNumber, isString, isArray } from 'lodash/fp'
import { isExisty } from '../../src/assert'

const notEmpty = val => !!val,
  pattern = patternVal => (val) => {
    patternVal.lastIndex = 0 // eslint-disable-line
    return patternVal.test(val)
  },
  required = isExisty,
  length = a => a.length,
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
