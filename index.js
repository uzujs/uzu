var debug = require('debug')('uzu:state')
var EventEmitter = require('events')

module.exports = createState

function createState (initialData) {
  var emitter = new EventEmitter()
  var state = initialData
  state.update = function update (data) {
    for (var name in data) {
      debug('updating state property: ' + name)
      if (!state.hasOwnProperty(name)) {
        throw new TypeError('Invalid property for state: ' + name)
      }
      state[name] = data[name]
      emitter.emit('update:' + name, data[name])
      debug('updated prop "' + name + '" to: ' + data[name])
    }
    return state
  }
  state.on = function on (props, fn) {
    if (!Array.isArray(props)) props = [props]
    debug('listening to changes for properties: ' + props)
    props.forEach(function (prop) {
      if (!state.hasOwnProperty(prop)) {
        throw new TypeError(`Undefined property '${prop}' for event handler`)
      }
      fn(state[prop])
      function handler (val) {
        debug('calling event handler for property: ' + prop)
        fn(val)
      }
      emitter.on('update:' + prop, handler)
      if (window && window.__uzu_onBind) {
        window.__uzu_onBind(emitter, 'update:' + prop, handler)
      }
      return state
    })
  }
  return state
}
