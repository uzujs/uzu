var mitt = require('mitt')

var snabbdom = require('snabbdom')
var patch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/dataset').default
])

var h = require('snabbdom/h').default

function component (options, children) {
  if (!options) options = {}
  if (!children) children = []
  if (!options.on) options.on = {}
  if (!options.state) options.state = {}
  if (!options.view) throw new TypeError('You must provide a .view function')

  // Return result containing {vnode, node, state, on, emit, view}

  var state = options.state
  var emitter = mitt()
  var instance = {
    state: state,
    on: emitter.on.bind(emitter),
    emit: emitter.emit.bind(emitter)
  }

  options.on.UPDATE = function update (toMerge) {
    if (toMerge) {
      for (var mergeKey in toMerge) {
        state[mergeKey] = toMerge[mergeKey]
      }
    }
    return render(instance, options.view)
  }

  for (let eventName in options.on) {
    emitter.on(eventName, function (data) {
      if (options.debug) {
        console.log('event', eventName)
      }
      options.on[eventName](data, state, instance.emit)
      if (options.debug) {
        console.log('  new state:', state)
      }
    })
  }

  var node = document.createElement('div')
  instance.vnode = patch(node, options.view(state, instance.emit))
  instance.node = instance.vnode.elm

  return instance
}

function render (component, view) {
  // Re-render a component
  var newVnode = patch(component.vnode, view(component.state, component.emit))
  component.vnode.data = newVnode.data
  component.vnode.elm = newVnode.elm
  component.vnode.children = newVnode.children
  component.vnode.key = newVnode.key
  component.vnode.text = newVnode.text
  component.vnode.sel = newVnode.sel
  component.node = newVnode.elm
  return component
}

module.exports = {h, component}
