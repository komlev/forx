import { T, map } from 'ramda'
import { runRule, normalizeRule } from '../src/rule'
import { config, value } from './rule/test-config.js'

describe('rule', () => {
  it('normalizeRule is returning correct value', () => {
    const func = () => true,
      rule = {
        value: 'address.line1',
        params: [['address', 'line1'], func, 'boo.boo'],
        test: [func, 'error'],
        enabled: [func],
        random: 1
      }
    expect(normalizeRule(rule)).toEqual({
      value: ['address', 'line1'],
      params: [['address', 'line1'], func, ['boo', 'boo']],
      test: [[func, 'error']],
      enabled: [func],
      random: 1
    })
  })

  it('runRule with all enabled is returning correct value', () => {
    const allEnabled = map(i => ({ ...i, enabled: [T] }), config)
    expect(runRule(allEnabled[0], value)).toEqual([])
    expect(runRule(allEnabled[0], {})).toEqual(['empty'])
    expect(runRule(allEnabled[1], value)).toEqual([])
    expect(runRule(allEnabled[1], {})).toEqual(['empty', 'min'])
    expect(runRule(allEnabled[2], value)).toEqual([])
    expect(runRule(allEnabled[2], {})).toEqual(['empty'])
    expect(runRule(allEnabled[3], value)).toEqual([])
    expect(runRule(allEnabled[3], {})).toEqual(['empty', 'custom'])
    expect(runRule(allEnabled[4], value)).toEqual([])
    expect(runRule(allEnabled[4], {})).toEqual(['required'])
    expect(runRule(allEnabled[5], value)).toEqual([[], []])
    expect(runRule(allEnabled[5], {})).toEqual(['empty'])
    expect(
      runRule(allEnabled[5], { team: [{ name: 'name' }, 1, null] })
    ).toEqual([[], ['empty'], ['empty']])
    expect(runRule(allEnabled[6], value)).toEqual([[], []])
    expect(runRule(allEnabled[6], {})).toEqual(['empty'])
    expect(runRule(allEnabled[7], value)).toEqual([[], []])
    expect(runRule(allEnabled[7], {})).toEqual(['required'])
    expect(runRule(allEnabled[8], value)).toEqual([[[], []], [[], []]])
    expect(runRule(allEnabled[8], {})).toEqual(['empty', 'custom'])
    expect(runRule(allEnabled[9], value)).toEqual([[[], []], [[], []]])
    expect(runRule(allEnabled[9], {})).toEqual(['empty', 'custom'])
  })

  it('runRule is returning correct value', () => {
    expect(runRule(config[0], value)).toEqual([])
    expect(runRule(config[0], {})).toEqual(['empty'])
    expect(runRule(config[1], value)).toEqual([])
    expect(runRule(config[1], {})).toEqual(['empty', 'min'])
    expect(runRule(config[2], value)).toEqual([])
    expect(runRule(config[2], {})).toEqual(['empty'])
    expect(runRule(config[3], value)).toEqual([])
    expect(runRule(config[3], {})).toEqual([])
    expect(runRule(config[4], value)).toEqual([])
    expect(runRule(config[4], {})).toEqual(['required'])
    expect(runRule(config[5], value)).toEqual([[], []])
    expect(runRule(config[5], {})).toEqual([])
    expect(runRule(config[5], { team: [{ name: 'name' }, 1, null] })).toEqual([
      [],
      ['empty'],
      ['empty']
    ])
    expect(runRule(config[6], value)).toEqual([[], []])
    expect(runRule(config[6], {})).toEqual([])
    expect(runRule(config[7], value)).toEqual([[], []])
    expect(runRule(config[7], {})).toEqual(['required'])
    expect(runRule(config[8], value)).toEqual([[[], []], [[], []]])
    expect(runRule(config[8], {})).toEqual([])
    expect(runRule(config[9], value)).toEqual([[[], []], [[], []]])
    expect(runRule(config[9], {})).toEqual([])
  })
})
