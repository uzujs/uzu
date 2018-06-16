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
  if (!options.actions) options.action = {}
  if (!options.state) options.state = {}
  if (!options.view) throw new TypeError('You must provide a .view function')

  // Return result containing {vnode, node, state, on, emit, view}
  var instance = {}

  var state = options.state
  var emitter = mitt()
  instance.state = state
  instance.on = emitter.on.bind(emitter)
  instance.emit = emitter.emit.bind(emitter)
  instance.view = options.view

  options.actions.UPDATE = function update (toMerge) {
    for (var mergeKey in toMerge) {
      state[mergeKey] = toMerge[mergeKey]
    }
    return render(instance)
  }

  for (let eventName in options.on) {
    emitter.on(eventName, function (data) {
      options.actions[eventName](data, state, instance.emit)
    })
  }

  var node = document.createElement('div')
  component.vnode = patch(node, options.view(state, instance.emit))
  component.node = component.vnode.elm

  return instance
}

function render (component) {
  // Re-render a component
  var newVnode = patch(component.vnode, component.view(component))
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
