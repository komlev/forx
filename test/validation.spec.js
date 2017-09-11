import { map } from 'ramda'
import {
  createRule,
  createRules,
  runRules,
  validate,
  filterErrors
} from '../src/validation'

describe('validation', () => {
  it('createRule is returning correct value', () => {
    expect(createRule([() => true, 'error'])(1).value).toBe(1)
    expect(createRule([() => false, 'error'])(1).value).toBe('error')
  })

  it('createRules is returning correct value', () => {
    expect(
      createRules([[() => true, 'error'], [() => false, 'error']])
    ).toBeInstanceOf(Array)
  })

  it('runRules returns correct value', () => {
    const result = runRules([
      [1],
      [[() => true, 'error'], [() => false, 'error']]
    ])
    expect(result).toBeInstanceOf(Array)
    expect(map(r => r.value, result)).toEqual([1, 'error'])
  })

  it('runRules returns correct value', () => {
    const result = runRules([[1], [[() => ({ error: 'error' })]]])
    expect(result).toBeInstanceOf(Array)
    expect(map(r => r.value, result)).toEqual([{ error: 'error' }])
  })

  it('filterErrors returns correct value', () => {
    let result = runRules([
      [1],
      [
        [() => true, 'error1'],
        [() => false, 'error2'],
        [() => true, 'error3'],
        [() => false, 'error4']
      ]
    ])
    result = filterErrors(result)
    expect(map(r => r.value, result)).toEqual(['error2', 'error4'])
  })

  it('validate returns correct value', () => {
    const result = validate([
      [[1], [[() => true, 'error'], [() => false, 'error']]]
    ])
    expect(result).toBeInstanceOf(Array)
    expect(map(v => map(r => r.value, v), result)).toEqual([['error']])
  })
})
