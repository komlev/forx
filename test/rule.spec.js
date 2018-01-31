import { map, cloneDeep } from 'lodash/fp'
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
        random: 1,
        to: 'custom'
      }
    expect(normalizeRule(rule)).toEqual({
      value: ['address', 'line1'],
      params: [['address', 'line1'], func, ['boo', 'boo']],
      test: [[func, 'error']],
      enabled: [func],
      random: 1,
      to: 'custom'
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
    expect(runNormalizedRule(config[10], value)).toEqual([])
    expect(runNormalizedRule(config[10], {})).toEqual(['no team'])
  })

  it('runRules', () => {
    expect(run(makeConfig(config), value)).toEqual({})
    expect(run(makeConfig(config), null)).toEqual({
      address: ['empty'],
      age: ['empty', 'min'],
      hasTeam: ['required'],
      name: ['empty'],
      customTeam: ['no team']
    })
    expect(run(makeConfig(config), null)).toEqual({
      address: ['empty'],
      age: ['empty', 'min'],
      hasTeam: ['required'],
      name: ['empty'],
      customTeam: ['no team']
    })
    const newValue = cloneDeep(value)
    newValue.team = [...newValue.team, { ...newValue.team[0], name: null }]
    expect(run(makeConfig(config), newValue)).toEqual({
      team: [undefined, undefined, { customName: ['empty'], name: ['empty'] }]
    })
  })

  it('provides path to the processed value', () => {
    const
      successMap2 = {
        'L.1.1': ['team', '0', 'address', '0'],
        'L.2.1': ['team', '1', 'address', '0'],
        'L.2.2': ['team', '1', 'address', '1']
      },
      successMap3 = {
        'L.1.1': ['team', 0, 'address', 0, 'line1'],
        'L.2.1': ['team', 1, 'address', 0, 'line1'],
        'L.2.2': ['team', 1, 'address', 1, 'line1']
      },
      successMap3b = {
        'L.1.1': { team: 0, address: 0 },
        'L.2.1': { team: 1, address: 0 },
        'L.2.2': { team: 1, address: 1 }
      },
      rule = {
      // -1
        value: 'team.address.line1',
        params: [
          'team.{team}.address.{address}.line1',
          'team.{team}.address.{address}.@',
          a => a
        ],
        test: [
          [(v, ...params) => {
            const [p1, p2, p3] = params
            expect(successMap2[p1]).toEqual(p2)
            expect(successMap3[p1]).toEqual(p3.current)
            expect(successMap3b[p1]).toEqual(p3.indexes)
            return true
          }, 'ERR']
        ]
      },
      valForTest = {
        team: [
          {
            address: [
              { line1: 'L.1.1' }
            ]
          },
          {
            address: [
              { line1: 'L.2.1' },
              { line1: 'L.2.2' }
            ]
          }
        ]
      }

    runNormalizedRule(rule, valForTest)
  })
})
