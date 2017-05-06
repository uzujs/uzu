var stream = require('../../ev-stream/index.js')

// TODO snabbdom update should bind new data into the event streams

module.exports = (accumulator) => {
  // Iterate over a vnode's actions
  function iter (vnode, fn) {
    var actions = vnode.data.actions || {}
    for (var event in actions) {
      var key = actions[event]
      if(Array.isArray(key) && key.length > 1) {
        var arg = key[1], key = key[0]
      }
      var s = accumulator[key]
      fn(key, event, s, arg)
    }
  }

  // Initialize action streams from vnode
  function initActions (emptyvnode, vnode) {
    iter(vnode, function(key, event, s, arg) {
      accumulator[key] = s || stream.create()
      bindEvent(vnode, event, accumulator[key], arg)
    })
  }

  // Destroy action streams in a removed vnode
  function destroyActions (vnode) {
    iter(vnode, function(key, event, stream, arg) {
      killStream(vnode, event, stream)
      delete accumulator[key]
    })
  }

  return {create: initActions, /*update: initActions,*/ destroy: destroyActions}
}

function bindEvent(vnode, event, s, arg) {
  vnode.elm.addEventListener(event, ev => { s(arg || ev) })
}

function killStream(vnode, event, stream) {
  vnode.elm.removeEventListener(event, stream)
  stream.updaters = []
}
