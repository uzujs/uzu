const curryN = require("ramda/src/curryN")
const stream = require("../../ev-stream/index.js")
const snabbdom = require('snabbdom')
var snabActions = require('../snabbdom-actions')

function render (init, view, defaults, container) {
  var actions = {}
  const patch = snabbdom.init([
    snabActions(actions)
  , require('snabbdom/modules/class').default
  , require('snabbdom/modules/props').default
  , require('snabbdom/modules/style').default
  , require('snabbdom/modules/attributes').default
  , require('snabbdom/modules/dataset').default
  ])

  const vnode = patch(container, view(defaults))
  function getAction (key) {
    if(!actions[key]) actions[key] = stream.create()
    return actions[key]
  }
  const state$ = init(getAction)
  const throttled$ = stream.throttle(10, state$)
  return stream.scan((vnode, d) => patch(vnode, view(d)), vnode, throttled$)
}

module.exports = curryN(3, render)
