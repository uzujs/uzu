var EventEmitter = require('events')

module.exports = model

function model (initialData) {
  if (!initialData || typeof initialData !== 'object') {
    throw new TypeError('Pass in an object of initial data when first creating the model. Got: ' + initialData)
  }
  var emitter = new EventEmitter()
  var model = initialData
  model._emitter = emitter
  model.update = function update (data) {
    for (var name in data) {
      if (!model.hasOwnProperty(name)) {
        throw new TypeError('Invalid property for model: ' + name)
      }
      model[name] = data[name]
      emitter.emit('update:' + name, data[name])
    }
    return model
  }
  model.on = function on (props, fn) {
    if (typeof props === 'string') props = [props]
    if (!Array.isArray(props)) {
      throw new TypeError('Pass in a single prop name or array of props')
    }
    for (var i = 0; i < props.length; ++i) {
      var prop = props[i]
      if (!model.hasOwnProperty(prop)) {
        throw new TypeError(`Undefined property '${prop}' for model`)
      }
      fn(model[prop])
      var handler = function (val) { fn(val) }
      emitter.on('update:' + prop, handler)
      var global
      try { global = window } catch (e) { global = process }
      if (global && global.__uzu_onBind) {
        global.__uzu_onBind(emitter, 'update:' + prop, handler)
      }
      return model
    }
  }
  return model
}
