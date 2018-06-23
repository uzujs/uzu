/**
 * Render snabbdom views to the page, updating when the global tree updates
 */

const {listen} = require('./experiment')
const snabbdom = require('snabbdom')
const patch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/attributes').default,
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/dataset').default
])
const h = require('snabbdom/h').default

module.exports = {render, h}

function render (container, view) {
  let vnode = patch(container, view())
  listen(function () {
    vnode = patch(vnode, view())
  })
}
