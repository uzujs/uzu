var stream = require('event-stream')

module.exports = function(all) {

  function initStreams (oldvnode, vnode) {
    var streams = vnode.data.streams || {}
    for (var event in streams) {
      var keys = Array.isArray(streams[event]) ? streams[event] : [streams[event]]
      for (var i = 0 ; i < keys.length ; ++i) {
        var key = keys[i]
        all[key] = all[key] || createStream(vnode, event)
      }
    }
  }

  function destroyStreams (vnode) {
    var streams = vnode.data.streams || {}
    for(var event in streams) {
      var keys = Array.isArray(streams[event]) ? streams[event] : [streams[event]]
      for (var i = 0 ; i < keys.length ; ++i) {
        var key = keys[i]
        var stream = all[key]
        killStream(vnode, event, stream)
        delete all[key]
      }
    }
  }

  function createStream(vnode, event) {
    var s = stream.create()
    vnode.elm.addEventListener(event, s)
    return s
  }

  function killStream(vnode, event, stream) {
    vnode.elm.removeEventListener(event, stream)
    stream.updaters = []
  }
  return {create: initStreams, update: initStreams, destroy: destroyStreams}
}
