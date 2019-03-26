// Use all useful snabbdom modules
const patch = require('snabbdom').init([
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/dataset').default,
  require('snabbdom/modules/attributes').default
])
const h = require('snabbdom/h').default

module.exports = { Component, h }

// Create a new UI component
function Component (obj) {
  const view = obj.view
  obj._viewArgs = []
  obj._vnode = patch(document.createElement('div'), h('div'))
  obj._render = function () {
    const newVnode = patch(obj._vnode, view.apply(obj, obj._viewArgs))
    // Do some efficient subtree patching
    // Update the existing vnode object, rather than using a new one, so it updates in-place
    for (let prop in newVnode) {
      obj._vnode[prop] = newVnode[prop]
    }
    return obj._vnode
  }
  obj.view = function () {
    return arguments.length ? obj._render() : obj._vnode
  }
  return obj
}
