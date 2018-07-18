const mitt = require('mitt')

const snabbdom = require('snabbdom')
const patch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/dataset').default,
  require('snabbdom/modules/attributes').default
])

const h = require('snabbdom/h').default

function component (options) {
  if (!options || !options.view) throw new TypeError('You must pass an object with a .view function')
  if (!('on' in options)) options.on = {}

  if (typeof options.on !== 'object') {
    throw new TypeError('options.on must be an object')
  }

  const state = options.state
  const handlers = {}
  const emitter = mitt(handlers)
  const instance = {
    view: options.view,
    state: state,
    on: function (eventName, callback) {
      emitter.on(eventName, callback)
    },
    emit: function (eventName, data) {
      if (!(eventName in handlers)) {
        throw new Error('Unknown event: ' + eventName + '. Events are: ' + Object.keys(handlers))
      }
      emitter.emit(eventName, data)
    }
  }

  for (let eventName in options.on) {
    emitter.on(eventName, function (data) {
      const result = options.on[eventName](data, instance.state, instance.emit)
      if (result && typeof result === 'object') {
        instance.state = Object.assign(instance.state, result)
      }
      render(instance, options.view)
    })
  }

  const node = document.createElement('div')
  const vnode = options.view(instance.state, instance.emit)
  if (!vnode || typeof vnode !== 'object' || !vnode.sel) {
    throw new TypeError('The view function must return a snabbdom vnode')
  }
  instance.vnode = patch(node, vnode)
  instance.node = instance.vnode.elm

  return instance
}

function render (component, view) {
  // Re-render a component
  // In our case, we mutate the original vnode to have all the new properties
  // This way, component.vnode is always up to date and references the same obj
  const newVnode = patch(component.vnode, view(component.state, component.emit))
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
  console.log(name + ' initial state:', component.state)
  component.on('*', function (eventName, data) {
    if (eventName === 'UPDATE') {
      console.log(name + ' UPDATE:', component.state)
    } else {
      console.log(name + ' ' + eventName)
    }
  })
  return component
}

module.exports = {h, component, debug}
