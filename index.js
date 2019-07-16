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

module.exports = { stateful, h }

function stateful (store, view) {
  var vnode = patch(document.createElement('div'), h('div'))
  vnode._store = store
  vnode._render = function () {
    var newVnode = patch(vnode, view(vnode))
    for (var prop in newVnode) {
      vnode[prop] = newVnode[prop]
    }
  }
  vnode._render()
  return vnode
}
