import is from 'is_js'
import { view, set as rSet, curry } from 'ramda'
import { getLens } from './path'

const _get = (path, value) => {
    if (!is.existy(path)) return undefined
    return view(getLens(path), value)
  },
  _set = (path, prop, value) => {
    if (!is.existy(path)) return value
    return rSet(getLens(path), prop, value)
  },
  get = curry(_get),
  set = curry(_set)

export { get, set, _get, _set }
