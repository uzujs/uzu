const curryN = require("ramda/src/curryN")
const stream = require("../../ev-stream/index.js")
const snabbdom = require('snabbdom')
var snabStreams = require('../snabbdom-streams')

function render (init, view, container) {
  var streams = {}
  const patch = snabbdom.init([
    snabStreams(streams)
  , require('snabbdom/modules/class').default
  , require('snabbdom/modules/props').default
  , require('snabbdom/modules/style').default
  , require('snabbdom/modules/attributes').default
  ])
  const dom$ = {}
  function domStreams (key) {
    if(!dom$[key]) {
      dom$[key] = stream.create()
    }
    return dom$[key]
  }

  const arg$ = init(domStreams)
  const patched = patch(container, view(arg$()))
  var forwarded = {}
  forwardAll(streams, domStreams, forwarded)
  const throttled$ = stream.throttle(10, arg$)
  return stream.scan((vnode, d) => {
    const newVnode = patch(vnode, view(d))
    setTimeout(() => forwardAll(streams, domStreams, forwarded), 0) // async
    return newVnode
  }, patched, throttled$)
}

// Forward all stream events from one object to another
function forwardAll (source, domStreams, forwarded) {
  console.log('forwarding', source)
  for(let key in source) { // Important to use ES6 'let' here!
    console.log('checking', key, forwarded)
    if(!forwarded[key]) {
      console.log('adding', key)
      stream.map(v => domStreams(key)(v), source[key])
      forwarded[key] = true
    }
  }
}

module.exports = curryN(3, render)
