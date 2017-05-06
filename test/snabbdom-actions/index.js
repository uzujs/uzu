const assert = require('assert')
const h = require('snabbdom/h').default
const snabbdom = require('snabbdom')

function view () {
  return h('div', [
    h('button', {actions: {click: 'one'}, props: {type: 'submit'}}, 'click me')
  , h('button', {actions: {click: 'two'}}, 'no, click me!')
  ])
}

test('it gathers up action streams', () => {
  var actions = {}
  const patch = snabbdom.init([require('../../snabbdom-actions')(actions)])
  const container = document.createElement('div')
  const vnode = patch(container, view())
  assert(actions.one.data, 'creates stream for first event')
  assert(actions.two.data, 'creates stream for second event')
})

test('it kills streams on destroy', () => {
  var actions = {}
  const patch = snabbdom.init([require('../../snabbdom-actions')(actions)])
  function blank() { return h('div', []) }
  const container = document.createElement('div')
  const vnode1 = patch(container, view())
  const vnode2 = patch(vnode1, blank())
  assert.deepEqual(actions, {})
})

