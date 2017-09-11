import { forEach } from 'ramda'
import { queryValue, getContextPath } from '../src/query'

describe('token', () => {
  const data = {
    name: 'name',
    list: [1, 2],
    arr: [[1, 2], [3, 4]],
    team: [
      {
        name: 'name1',
        list: [{ item: 'item1' }, { item: 'item2' }]
      },
      {
        name: 'name2',
        list: [{ item: 'item3' }, { item: 'item4' }]
      }
    ]
  }

  it('getContextPath is returning correct value', () => {
    expect(getContextPath('path.test')).toEqual(['path', 'test'])
    expect(getContextPath('path.{var}.test.{var2}.some.{var}')).toEqual([
      'path',
      'undefined',
      'test',
      'undefined',
      'some',
      'undefined'
    ])
    expect(
      getContextPath('path.{var}.test.{var2}.some.{var}', { var: 1, var2: 'a' })
    ).toEqual(['path', 1, 'test', 'a', 'some', 1])
    expect(
      getContextPath(['path', '{var}', 'test', '{var2}', 'some', '{var}'], {
        var: 1,
        var2: 'a'
      })
    ).toEqual(['path', 1, 'test', 'a', 'some', 1])
  })

  it('queryValue returns valid current paths', () => {
    forEach(
      ([item, result, val]) => {
        const curPaths = [],
          run = (value, context) => {
            curPaths.push(context.currentPath)
          }
        queryValue(item, val || data, run)
        expect(curPaths).toEqual(result)
      },
      [
        [[], [[]]],
        ['0.name', [[0, 'name']], [{ name: 'name' }]],
        ['0', [[0]], [{ name: 'name' }]],
        ['0', [[0]], 'abc'],
        [
          '.name',
          [[0, 'name'], [1, 'name']],
          [{ name: 'name' }, { name: 'name' }]
        ],
        ['name', [[0, 'name']], [{ name: 'name' }]],
        ['name', [['name']]],
        ['abc', [['abc']]],
        ['list', [['list']]],
        ['list.', [['list', 0], ['list', 1]]],
        ['arr', [['arr']]],
        ['arr.', [['arr', 0], ['arr', 1]]],
        ['arr.0', [['arr', 0]]],
        ['arr.0.0', [['arr', 0, 0]]],
        ['arr.0.', [['arr', 0, 0], ['arr', 0, 1]]],
        ['team.0.name', [['team', 0, 'name']]],
        ['team.0.list.0.item', [['team', 0, 'list', 0, 'item']]],
        ['team.0.list.0.abc', [['team', 0, 'list', 0, 'abc']]],
        ['team.name', [['team', 0, 'name'], ['team', 1, 'name']]],
        [
          'team.list.0.item',
          [['team', 0, 'list', 0, 'item'], ['team', 1, 'list', 0, 'item']]
        ],
        ['team.list.2.item', [['team', 0, 'list', 2], ['team', 1, 'list', 2]]],
        [
          'team.list.item',
          [
            ['team', 0, 'list', 0, 'item'],
            ['team', 0, 'list', 1, 'item'],
            ['team', 1, 'list', 0, 'item'],
            ['team', 1, 'list', 1, 'item']
          ]
        ]
      ]
    )
  })

  it('queryValue is returning corrent value', () => {
    // HAPPY PATH
    expect(queryValue([], data)).toEqual(data)
    expect(queryValue('0.name', [{ name: 'name' }])).toEqual('name')
    expect(queryValue('0', [{ name: 'name' }])).toEqual({ name: 'name' })
    expect(queryValue('0', 'abc')).toEqual('a')
    expect(queryValue('.name', [{ name: 'name' }])).toEqual(['name'])
    expect(queryValue('name', [{ name: 'name' }])).toEqual(['name'])
    expect(queryValue('name', data)).toEqual('name')
    expect(queryValue('abc', data)).toEqual(undefined)
    expect(queryValue('list', data)).toEqual([1, 2])
    expect(queryValue('list.', data)).toEqual([1, 2])
    expect(queryValue('arr', data)).toEqual([[1, 2], [3, 4]])
    expect(queryValue('arr.0', data)).toEqual([1, 2])
    expect(queryValue('arr.0.0', data)).toEqual(1)
    expect(queryValue('team.0.name', data)).toEqual('name1')
    expect(queryValue('team.0.list.0.item', data)).toEqual('item1')
    expect(queryValue('team.0.list.0.abc', data)).toEqual(undefined)
    expect(queryValue('team.name', data)).toEqual(['name1', 'name2'])
    expect(queryValue('team.list.0.item', data)).toEqual(['item1', 'item3'])
    expect(queryValue('team.list.2.item', data)).toEqual([undefined, undefined])
    expect(queryValue('team.list.item', data)).toEqual([
      ['item1', 'item2'],
      ['item3', 'item4']
    ])

    // BAD
    expect(queryValue([], null)).toEqual(null)
    expect(queryValue('0.name', null)).toEqual(undefined)
    expect(queryValue('0', null)).toEqual(undefined)
    expect(queryValue('.name', null)).toEqual(undefined)
    expect(queryValue('name', null)).toEqual(undefined)
    expect(queryValue('name', null)).toEqual(undefined)
    expect(queryValue('abc', null)).toEqual(undefined)
    expect(queryValue('list', null)).toEqual(undefined)
    expect(queryValue('list.', null)).toEqual(undefined)
    expect(queryValue('arr', null)).toEqual(undefined)
    expect(queryValue('arr.0', null)).toEqual(undefined)
    expect(queryValue('arr.0.0', null)).toEqual(undefined)
    expect(queryValue('team.0.name', null)).toEqual(undefined)
    expect(queryValue('team.0.list.0.item', null)).toEqual(undefined)
    expect(queryValue('team.0.list.0.abc', null)).toEqual(undefined)
    expect(queryValue('team.name', null)).toEqual(undefined)
    expect(queryValue('team.list.0.item', null)).toEqual(undefined)
    expect(queryValue('team.list.2.item', null)).toEqual(undefined)
    expect(queryValue('team.list.item', null)).toEqual(undefined)
  })

  it('queryValue map function is returning corrent value', () => {
    let counter = 0,
      res = []

    const mapFunc = (val) => {
        res.push(val)
        counter += 1
        return val
      },
      reset = () => {
        counter = 0
        res = []
      }

    forEach(
      ([item, result, num, val]) => {
        reset()
        queryValue(item, val || data, mapFunc)
        expect(res).toEqual(result)
        expect(counter).toEqual(num)
      },
      [
        [[], [data], 1],
        ['0.name', ['name'], 1, [{ name: 'name' }]],
        ['0', [{ name: 'name' }], 1, [{ name: 'name' }]],
        ['0', ['a'], 1, 'abc'],
        ['.name', ['name', 'name'], 2, [{ name: 'name' }, { name: 'name' }]],
        ['name', ['name'], 1, [{ name: 'name' }]],
        ['name', ['name'], 1],
        ['abc', [undefined], 1],
        ['list', [[1, 2]], 1],
        ['list.', [1, 2], 2],
        ['arr', [[[1, 2], [3, 4]]], 1],
        ['arr.', [[1, 2], [3, 4]], 2],
        ['arr.0', [[1, 2]], 1],
        ['arr.0.0', [1], 1],
        ['arr.0.', [1, 2], 2],
        ['team.0.name', ['name1'], 1],
        ['team.0.list.0.item', ['item1'], 1],
        ['team.0.list.0.abc', [undefined], 1],
        ['team.name', ['name1', 'name2'], 2],
        ['team.list.0.item', ['item1', 'item3'], 2],
        ['team.list.2.item', [undefined, undefined], 2],
        ['team.list.item', ['item1', 'item2', 'item3', 'item4'], 4]
      ]
    )
  })

  it('queryValue map function is returning corrent value', () => {
    const mapContext = (val, context) => context.indexes
    forEach(
      ([item, result, val]) => {
        const res = queryValue(item, val || data, mapContext)
        expect(res).toEqual(result)
      },
      [
        ['0.name', undefined, [{ name: 'name' }]],
        ['.name', [{ 0: 0 }, { 0: 1 }], [{ name: 'name' }, { name: 'name' }]],
        ['name', [{ 0: 0 }], [{ name: 'name' }]],
        ['list.', [{ list: 0 }, { list: 1 }]],
        [
          'team.list.item',
          [
            [{ team: 0, list: 0 }, { team: 0, list: 1 }],
            [{ team: 1, list: 0 }, { team: 1, list: 1 }]
          ]
        ]
      ]
    )
  })

  it('queryValue cotext has proper reach flag', () => {
    const mapContext = (val, context) => context.reached
    forEach(
      ([item, result, val]) => {
        const res = queryValue(item, val || data, mapContext)
        expect(res).toEqual(result)
      },
      [
        [[], true, { name: 'name' }],
        ['name', true, { name: 'hello' }],
        ['0.name', true, [{ name: 'name' }]],
        [
          '.name',
          [true, true, false, false, false, true, true],
          [
            { name: 'name' },
            { name: 'name' },
            1,
            null,
            undefined,
            { name: null },
            { name: undefined }
          ]
        ]
      ]
    )
  })
})
