import { map } from 'lodash/fp'
import { runRule, normalizeRule, run, makeConfig } from '../src/rule'
import { config, value } from './rule/test-config'

const runNormalizedRule = (rule, val) => runRule(normalizeRule(rule), val)
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
    const allEnabled = map(i => ({ ...i, enabled: [() => true] }), config)
    expect(runNormalizedRule(allEnabled[0], value)).toEqual([])
    expect(runNormalizedRule(allEnabled[0], {})).toEqual(['empty'])
    expect(runNormalizedRule(allEnabled[1], value)).toEqual([])
    expect(runNormalizedRule(allEnabled[1], {})).toEqual(['empty', 'min'])
    expect(runNormalizedRule(allEnabled[2], value)).toEqual([])
    expect(runNormalizedRule(allEnabled[2], {})).toEqual(['empty'])
    expect(runNormalizedRule(allEnabled[3], value)).toEqual([])
    expect(runNormalizedRule(allEnabled[3], {})).toEqual(['empty', 'custom'])
    expect(runNormalizedRule(allEnabled[4], value)).toEqual([])
    expect(runNormalizedRule(allEnabled[4], {})).toEqual(['required'])
    expect(runNormalizedRule(allEnabled[5], value)).toEqual([[], []])
    expect(runNormalizedRule(allEnabled[5], {})).toEqual(['empty'])
    expect(
      runRule(allEnabled[5], { team: [{ name: 'name' }, 1, null] })
    ).toEqual([[], ['empty'], ['empty']])
    expect(runNormalizedRule(allEnabled[6], value)).toEqual([[], []])
    expect(runNormalizedRule(allEnabled[6], {})).toEqual(['empty'])
    expect(runNormalizedRule(allEnabled[7], value)).toEqual([[], []])
    expect(runNormalizedRule(allEnabled[7], {})).toEqual(['required'])
    expect(runNormalizedRule(allEnabled[8], value)).toEqual([
      [[], []],
      [[], []]
    ])
    expect(runNormalizedRule(allEnabled[8], {})).toEqual(['empty', 'custom'])
    expect(runNormalizedRule(allEnabled[9], value)).toEqual([
      [[], []],
      [[], []]
    ])
    expect(runNormalizedRule(allEnabled[9], {})).toEqual(['empty', 'custom'])
  })

  it('runRule is returning correct value', () => {
    expect(runNormalizedRule(config[0], value)).toEqual([])
    expect(runNormalizedRule(config[0], {})).toEqual(['empty'])
    expect(runNormalizedRule(config[1], value)).toEqual([])
    expect(runNormalizedRule(config[1], {})).toEqual(['empty', 'min'])
    expect(runNormalizedRule(config[2], value)).toEqual([])
    expect(runNormalizedRule(config[2], {})).toEqual(['empty'])
    expect(runNormalizedRule(config[3], value)).toEqual([])
    expect(runNormalizedRule(config[3], {})).toEqual([])
    expect(runNormalizedRule(config[4], value)).toEqual([])
    expect(runNormalizedRule(config[4], {})).toEqual(['required'])
    expect(runNormalizedRule(config[5], value)).toEqual([[], []])
    expect(runNormalizedRule(config[5], {})).toEqual([])
    expect(
      runNormalizedRule(config[5], { team: [{ name: 'name' }, 1, null] })
    ).toEqual([[], ['empty'], ['empty']])
    expect(runNormalizedRule(config[6], value)).toEqual([[], []])
    expect(runNormalizedRule(config[6], {})).toEqual([])
    expect(runNormalizedRule(config[7], value)).toEqual([[], []])
    expect(runNormalizedRule(config[7], {})).toEqual([])
    expect(runNormalizedRule(config[7], { team: [1, 2] })).toEqual([
      ['required'],
      ['required']
    ])
    expect(runNormalizedRule(config[8], value)).toEqual([[[], []], [[], []]])
    expect(runNormalizedRule(config[8], {})).toEqual([])
    expect(runNormalizedRule(config[9], value)).toEqual([[[], []], [[], []]])
    expect(runNormalizedRule(config[9], {})).toEqual([])
  })

  it('runRules', () => {
    expect(run(makeConfig(config), value)).toEqual({})
    expect(run(makeConfig(config), null)).toEqual({
      address: ['empty'],
      age: ['empty', 'min'],
      hasTeam: ['required'],
      name: ['empty']
    })
    expect(run(makeConfig(config), null)).toEqual({
      address: ['empty'],
      age: ['empty', 'min'],
      hasTeam: ['required'],
      name: ['empty']
    })
  })
})
