/* eslint-disable one-var */
import { isIndex, parseIndex, flattenFilter, indexMap, doWhile } from '../src/utils'

describe('utils', () => {
  it('isIndex is returning correct value', () => {
    expect(isIndex(1)).toEqual(true)
    expect(isIndex('1')).toEqual(true)
    expect(isIndex('[1]')).toEqual(false)
    expect(isIndex('1a')).toEqual(false)
    expect(isIndex('team')).toEqual(false)
    expect(isIndex('team')).toEqual(false)
    expect(isIndex(null)).toEqual(false)
    expect(isIndex(undefined)).toEqual(false)
    expect(isIndex([])).toEqual(false)
  })

  it('isIndex is returning correct value', () => {
    expect(parseIndex(1)).toEqual(1)
    expect(parseIndex('1')).toEqual(1)
    expect(parseIndex('1a')).toEqual('1a')
    expect(parseIndex('[1]')).toEqual('[1]')
    expect(parseIndex('team')).toEqual('team')
    expect(parseIndex(null)).toEqual(null)
    expect(parseIndex(undefined)).toEqual(undefined)
    expect(parseIndex([])).toEqual([])
  })

  it('flattenFilter is returning correct value', () => {
    expect(
      flattenFilter([1, 'some', [2, 3, null], undefined, '', [null, [4]]])
    ).toEqual([1, 'some', 2, 3, '', 4])
  })

  it('indexMap is returning correct value', () => {
    expect(indexMap((a, i) => i, [1, 1, 1, 1, 1])).toEqual([0, 1, 2, 3, 4])
  })

  it('doWhile is working properly', () => {
    let res = 0
    doWhile(() => {
      res += 1
      return res > 2
    })
    expect(res).toEqual(3)
  })
})
