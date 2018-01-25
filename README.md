# Forx
Javascript validational library.

[![Coverage Status](https://coveralls.io/repos/github/komlev/forx/badge.svg?branch=master)](https://coveralls.io/github/komlev/forx?branch=master)

## Validation
Configuration is written as an array of validation objects.

Suppose this is the data we validate on:
```js
{
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
}
```
Validation on fields like **name**, **age**, **hasTeam** is trivial, but validation on nested objects, arrays and combination of those might be problematic. **Forx** deals with this problem.

And here is a validation config:
Here is how validation config looks like:
```js
[
  // validation on age field
  {
    value: 'age',
    test: [
      [required, 'empty'],
      [min(18), () => 'min']
    ]
  },
  // validation on nested field
  {
    value: 'address.line1',
    test: [
      [required, 'empty']
    ]
  },
  // validation on object inside an array
  {
    value: 'team.name',
    params: ['team'],
    test: [
      [required, 'empty']
    ],
    enabled: [(name, team) => !!team]
  },
  // deep nested validation
  {
    value: ['team', 'position', 'role'],
    params: ['team'],
    test: [
      [required, () => 'empty']
    ],
    enabled: [(role, team) => !!team]
  },
  {
    value: 'name',
    to: 'nameError',
    test: [
      [required, 'empty']
    ]
  }
]
```

Validation on given data will return empty object - no errors.
But if we validate on invalid data error object might look like this:
```js
{
  age: ['empty', 'min'],
  address: {
    line: ['empty']
  },
  team: [
    {
      name: ['empty'],
      position: {
        role: ['empty']
      }
    }
  ],
  nameError: ['empty']
}
```

## Validation objects

Example of validate object:
```js
{
  value: 'value',
  params: ['some.extra', 'data'],
  to: 'custom',
  test: [
    [
      (value, ...params) => value !== undefined,
      'error message'
    ],
    [
      (value, ...params) => value !== 0 ? true : 'error message'
    ]
  ]
}
```

### Required fields:
+ **value** - path. Main field against which validation will work.
This field will go as first parameter into test/enabled/message functions.
+ **test** - array of arrays with this notation:
```js
[testFunction, message]
```

Where **testFunction** is a function which receives data from **value** and **params** fields.
*If function returns *true* then there is no error and no error message is returned.*
*If function returns string this will be taken as an error.*
*If function returns Boolean false **message** object will be taken into account.*
**Message** might be string or function, which will be returned if validation function fails.

### Optional fields:

+ **params** - array of paths. Extra parameters you might like to have in your functions.
+ **to** - path. Instead of writing error into the same **value** path, error might be written into custom path provided.
+ **enabled** - array of values/functions which enables/disables validation functions. Might be useful disabling some validation based on inputs.

### Path

Data is retrieved and written through the [q3000](https://www.npmjs.com/package/q3000) library.

```js
const data = {
  simple: 'simple',
  nested: { nested2: { data: 1 }, nested3: ['a', 'b'] },
  list: [
    { nested4: { data: 2 } },
    { nested4: { data: 3 } }
  ]
}

'simple' // "simple"
'nested.nested2' // { data: 1 }
'nested.nested2.data' // 1
'nested.nested3.0' // 'a'
'list.nested4.data' // [ 2, 3 ]
'list.0.nested4.data' // 2

//These are equivalents
'nested.nested3' // ['a', 'b']
'nested.nested3.*' // ['a', 'b']
['nested', 'nested3', '*'] // ['a', 'b']

//These are equivalents
'list' // [ { nested4: { data: 2 } }, { nested4:{ data: 3 } } ],
'list.*' // [ { nested4: { data: 2 } }, { nested4:{ data: 3 } } ]
'list[*]' // [ { nested4: { data: 2 } }, { nested4:{ data: 3 } } ]

//These are equivalents
'list.0' // { nested4: { data: 2 } }
'list[0]' // { nested4:{ data: 3 } }

//These are equivalents
'list.nested4' // [ { data: 2 }, { data: 3 } ]
'list.*.nested4' // [ { data: 2 }, { data: 3 } ]
```

### Path context
Assume you have this data
```js
{
  team: [
    {
      list: [
        { list: [ { a:1, b: true }, { a:2, b: false } ] },
        { list: [ { a:3, b: true }, { a:4, b: false } ] }
      ]
    },
    {
      list: [
        { list: [ { a:5, b: true }, { a:6, b: false } ] },
        { list: [ { a:7, b: true }, { a:8, b: false } ] }
      ]
    }
  ]
}
```

And idea is to validate *a* fields inside items in *team.list.list* path.
You also need to get *b* field from the item you currently validating. Here is there context come into play.

For this case validation config might look like this:
```js
[
  {
    value: 'team.list.list.a',
    params: ['{team}.{list}.{list2}.b'],
    to: '{team}.{list}.{list2}.customError',
    test: [
      [(a, b) => (b && a > 4), 'error']
    ]
  }
]
```

It is possible to use context inside path for **params** and **to** fields.
It is possible to address current context via curly braces *{team}*.
If path has identical names like in case with *list* it will automatically adds incremental IDs to new each name. *{list}.{list2}*.

## License
MIT
