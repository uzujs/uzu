var stream = require('../../ev-stream/index.js')

// TODO snabbdom update should bind new data into the event streams

module.exports = (accumulator) => {
  var dataCache = {}
  var id = 0

  // Iterate over a vnode's actions
  function iter (vnode, fn) {
    var actions = vnode.data.actions || {}
    for (var event in actions) {
      if(event !== 'data') {
        var key = actions[event]
        fn(key, event, accumulator[key])
      }
    }
  }

  function updateData (oldvnode, vnode) {
    vnode.actionID = oldvnode.actionID
    dataCache[vnode.actionID] = (vnode.data.actions || {}).data
  }

  // Initialize action streams from vnode
  function initActions (emptyvnode, vnode) {
    vnode.actionID = id++
    dataCache[vnode.actionID] = (vnode.data.actions || {}).data
    iter(vnode, function(key, event, s) {
      accumulator[key] = s || stream.create()
      bindEvent(vnode, event, accumulator[key])
    })
  }

  // Destroy action streams in a removed vnode
  function destroyActions (vnode) {
    iter(vnode, function(key, event, stream, arg) {
      killEvent(vnode, event, stream)
      delete accumulator[key]
      delete dataCache[vnode.actionID]
    })
  }

  function bindEvent(vnode, event, s, arg) {
    vnode.elm.addEventListener(event, ev => { 
      s(dataCache[vnode.actionID] || ev)
    })
  }

  function killEvent(vnode, event, stream) {
    vnode.elm.removeEventListener(event, stream)
    stream.updaters = []
  }

  return {create: initActions, update: updateData, destroy: destroyActions}
}
