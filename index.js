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

  if (typeof options.state !== 'object') {
    throw new TypeError('The .state option for a component must be an object')
  }

  const state = options.state
  const emitter = mitt()
  const instance = {
    state: state,
    on: emitter.on.bind(emitter),
    emit: emitter.emit.bind(emitter)
  }

  if (options.on.UPDATE) {
    throw new Error('You cannot overwrite the UPDATE event: it is a reserved event name.')
  }

  options.on.UPDATE = function update (newState) {
    if (newState !== undefined) {
      instance.state = newState
    }
    return render(instance, options.view)
  }

  for (let eventName in options.on) {
    emitter.on(eventName, function (data) {
      if (options.debug) {
        console.log('event', eventName)
      }
      options.on[eventName](data, instance.state, instance.emit)
    })
  }

  var node = document.createElement('div')
  instance.vnode = patch(node, options.view(instance.state, instance.emit))
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

function debug (component, name = '') {
  // Print a log of debug messages for every event for a component
  component.on('*', function (eventName, data) {
    if (eventName === 'UPDATE') {
      console.log(name + ' state:', component.state)
    } else {
      console.log(name + ' event:', eventName, name)
    }
  })
  return component
}

module.exports = {h, component, debug}
