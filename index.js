var EventEmitter = require('events')

module.exports = state

function state (initialData) {
  if (!initialData || typeof initialData !== 'object') {
    throw new TypeError('Pass in an object of initial data when first creating the state. Got: ' + initialData)
  }
  var emitter = new EventEmitter()
  var state = initialData
  state._emitter = emitter
  state.update = function update (data) {
    for (var name in data) {
      if (!state.hasOwnProperty(name)) {
        throw new TypeError('Invalid property for state: ' + name)
      }
      state[name] = data[name]
      emitter.emit('update:' + name, data[name])
    }
    return state
  }
  state.on = function on (props, fn) {
    if (typeof props === 'string') props = [props]
    if (!Array.isArray(props)) {
      throw new TypeError('Pass in a single prop name or array of props')
    }
    for (var i = 0; i < props.length; ++i) {
      var prop = props[i]
      if (!state.hasOwnProperty(prop)) {
        throw new TypeError(`Undefined property '${prop}' for state`)
      }
      fn(state[prop])
      var handler = function (val) { fn(val) }
      emitter.on('update:' + prop, handler)
      var global
      try { global = window } catch (e) { global = process }
      if (global && global.__uzu_onBind) {
        global.__uzu_onBind(emitter, 'update:' + prop, handler)
      }
      return state
    }
  }
  return state
}
