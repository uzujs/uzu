var stream = require('ev-stream')
var curryN = require('ramda/src/curryN')

function render (init, view, container) {
  var arg$ = init(initialDom)
  var initialVNode = view(arg$())
  var patched = patch(container, initialVNode)
  return stream.scan(function (vnode, d) { return patch(d, view(d)) }, patched, arg$)
}

var initialDom = {
  change: stream.create()
, click: stream.create()
, submit: stream.create()
}

module.exports = curryN(3, render)
