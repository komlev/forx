import { notEmpty, required, min, maxLength, pattern } from './test-validation'

const value = {
    name: 'Name',
    age: 20,
    address: { line1: 'Line 1' },
    hasTeam: true,
    team: [
      {
        name: 'Team member 1',
        position: {
          role: 'Manager'
        },
        address: [
          { line1: 'Line 1', postCode: { value: 1 } },
          { line1: 'Line 2', postCode: { value: 2 } }
        ]
      },
      {
        name: 'Team member 2',
        position: {
          role: 'Manager'
        },
        address: [
          { line1: 'Line 3', postCode: { value: 3 } },
          { line1: 'Line 4', postCode: { value: 4 } }
        ]
      }
    ]
  },
  config = [
    {
      // 0
      value: 'name',
      params: ['name', 'age'],
      test: [
        [notEmpty, 'empty'],
        [maxLength(50), () => 'max length'],
        [pattern(/\w/gim), 'pattern']
      ]
    },
    {
      // 1
      value: 'age',
      test: [[notEmpty, 'empty'], [min(18), () => 'min']]
    },
    {
      // 2
      value: 'address',
      test: [[required, 'empty']]
    },
    {
      // 3
      value: 'address.line1',
      params: ['address', () => 'uk'],
      test: [
        [notEmpty, 'empty'],
        [maxLength(50), () => 'max length'],
        [
          (line1, addr, postCode) =>
            addr &&
            addr.line1 === 'Line 1' &&
            line1 === 'Line 1' &&
            postCode === 'uk',
          'custom'
        ]
      ],
      enabled: [(line1, address) => !!address]
    },
    {
      // 4
      value: 'hasTeam',
      test: [[required, 'required']]
    },
    {
      // 5
      value: 'team.name',
      params: ['team'],
      test: [[notEmpty, 'empty']],
      enabled: [(role, team) => !!team]
    },
    {
      // 6
      value: ['team', 'position', 'role'],
      params: ['team'],
      test: [[notEmpty, () => 'empty']],
      enabled: [(role, team) => !!team]
    },
    {
      // 7
      value: ['team', 'address'],
      test: [required, 'required']
    },
    {
      // 8
      value: ['team', 'address', 'line1'],
      params: [
        ['team', '{team}', 'address', '{address}', 'line1'],
        'team.{team}.address.{address}'
      ],
      test: [
        [notEmpty, 'empty'],
        [maxLength(50), () => 'max length'],
        [
          (line1, lineAgain, addr) =>
            line1 === lineAgain &&
            addr &&
            addr.line1.indexOf('Line') !== -1 &&
            line1.indexOf('Line') !== -1,
          'custom'
        ]
      ],
      enabled: [
        (line1, lineAgain, addr) => !!addr,
        (line1, lineAgain, addr) => !!addr,
        () => true
      ]
    },
    {
      // 9
      value: ['team', 'address', 'postCode', 'value'],
      params: [
        ['team', '{team}', 'address', '{address}', 'line1'],
        'team.{team}.address.{address}'
      ],
      test: [
        [notEmpty, 'empty'],
        [maxLength(50), () => 'max length'],
        [
          (postCode, line1, addr) =>
            !!(addr && addr.line1 === line1 && postCode),
          'custom'
        ]
      ],
      enabled: [(line1, address) => !!address, (line1, address) => !!address]
    }
  ]

export { value, config }
