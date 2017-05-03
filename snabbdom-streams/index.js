var stream = require('ev-stream')

var all = {}

function initStream (vnode) {
  var streams = vnode.data.streams || {}
  for(var event in streams) {
    var s = stream.create()
    vnode.elm.addEventListener(event, s)
    all[event] = all[event] || {}
    all[event][streams[event]] = s
  }
  vnode.data.streams._all = all
}

module.exports = {create: initStream}
