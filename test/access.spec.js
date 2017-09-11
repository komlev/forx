/* eslint-disable one-var */
import { clone } from 'ramda'
import { get, set } from '../src/access'

describe('access', () => {
  const val = {
      name: 'name',
      age: 1,
      profile: { img: 'img' },
      team: [{ name: 'name1' }, { name: 'name2' }]
    },
    getCopy = () => clone(val)

  it('get is returning correct value', () => {
    // happy path
    expect(get('name', val)).toEqual('name')
    expect(get('age', val)).toEqual(1)
    expect(get('profile', val)).toEqual(val.profile)
    expect(get('profile.img', val)).toEqual('img')
    expect(get('team.0.name', val)).toEqual('name1')

    expect(get('random', val)).toEqual(undefined)
    expect(get('random', null)).toEqual(undefined)
    expect(get('random', undefined)).toEqual(undefined)
    expect(get(null, val)).toEqual(undefined)
    expect(get(null, null)).toEqual(undefined)
    expect(get(null, undefined)).toEqual(undefined)
  })

  it('set is setting data correctly', () => {
    const nameCopy = getCopy(val),
      profileCopy = getCopy(val),
      teamCopy = getCopy(val),
      rewriteCopy = getCopy(val)

    nameCopy.name = 'test'
    expect(set('name', 'test', val)).toEqual(nameCopy)

    profileCopy.profile.img = 'test'
    expect(set('profile.img', 'test', val)).toEqual(profileCopy)

    teamCopy.team[0].name = 'test'
    expect(set('team.0.name', 'test', val)).toEqual(teamCopy)

    rewriteCopy.age = { hm: 'test' }
    expect(set('age.hm', 'test', val)).toEqual(rewriteCopy)
  })
})
