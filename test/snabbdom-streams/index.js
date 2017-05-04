const assert = require('assert')
const h = require('snabbdom/h').default
const snabbdom = require('snabbdom')
const patch = snabbdom.init([require('../../snabbdom-streams')])

function view () {
  return h('div', [
    h('button', {streams: {click: 'one'}, props: {type: 'submit'}}, 'click me')
  , h('button', {streams: {click: 'two'}}, 'no, click me!')
  ])
}

test('it gathers up streams', () => {
  const container = document.createElement('div')
  const vnode = patch(container, view())
  const streams = vnode.data.__streams
  assert(streams.one.data, 'creates stream for first event')
  assert(streams.two.data, 'creates stream for second event')
})

test('it kills streams on destroy', () => {
  function blank() { return h('div', []) }
  const container = document.createElement('div')
  const vnode1 = patch(container, view())
  const vnode2 = patch(vnode1, blank())
  const streams2 = vnode2.data.__streams
  assert.deepEqual(streams2, {})
})

