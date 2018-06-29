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

module.exports = {system, component, collection, h}

// what's good
// state update keys are output events
// parent scopes can access child scope events
// giant cycle
//

function component (options) {
  // This does nothing really. It only does run-time validation of the options.
  const comp = Object.assign({
    send: {},
    state: {},
    receive: {},
    _isComponent: true
  }, options)
  // TODO validations
  return comp
}

function system (children, view) {
  function init () {
    const emitter = mitt()
    const initializedChildren = {}
    const sys = {_isSystem: true, emitter: emitter, children: initializedChildren}
    for (let childName in children) {
      const child = children[childName]
      // TODO type check
      if (child._isComponent) {
        initializedChildren[childName] = {state: child.state}
        for (let signalName in child.receive) {
          const callback = child.receive[signalName]
          const handler = (data) => {
            const result = callback(data, child.state)
            // TODO typecheck result
            if (result !== undefined) {
              const state = initializedChildren[childName].state
              initializedChildren[childName].state = Object.assign(state, result)
            }
            render(sys, view)
          }
          emitter.on(signalName, handler)
        }
      } else if (child._isSystem) {
        const childSys = child.init()
        initializedChildren[childName] = childSys
        childSys.emitter.on('*', function (eventName, data) {
          emitter.emit(childName + ':' + eventName, data)
          emitter.emit(childName + ':' + '*', data)
        })
      }
    }

    sys.send = emitter.emit.bind(emitter)

    // Snabbdom will replace this node, so it's just a placeholder
    const node = document.createElement('div')
    const vnode = view(initializedChildren, sys.send)
    if (!vnode || typeof vnode !== 'object' || !vnode.sel) {
      throw new TypeError('The view function must return a snabbdom vnode')
    }
    sys.vnode = patch(node, vnode)
    sys.node = sys.vnode.elm
    return sys
  }

  return {
    _isSystem: true,
    children,
    view,
    init
  }
}

function render (sys, view) {
  // Re-render a component
  // In our case, we mutate the original vnode to have all the new properties
  // This way, sys.vnode is always up to date and always references the same obj
  const newVnode = patch(sys.vnode, view(sys.children, sys.send))
  sys.vnode.data = newVnode.data
  sys.vnode.elm = newVnode.elm
  sys.vnode.children = newVnode.children
  sys.vnode.key = newVnode.key
  sys.vnode.text = newVnode.text
  sys.vnode.sel = newVnode.sel
  sys.node = newVnode.elm
}

function collection (component, options) {
  // can leave for the end -- trickiness
  // options.initial
  // options.append
  // options.remove
}
