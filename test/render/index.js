const R = require('ramda')
const stream = require('../../../ev-stream/index.js')
const assert = require('assert')
const render = require('../../render')
const h = require('../../h')

// TODO how to pass in dynamic data to the streams, while keeping the streams module create-only

function view (counters) {
  return h('div', [
    h('button', {actions: {click: 'addCounter'}}, 'Add Counter')
  , h('div', counters.map(viewCounter))
  ])
}

function viewCounter (count, idx) {
  return h('div', [
    h('p', 'Total is ' + count)
  , h('button', {actions: {click: ['add', [idx, 1]]}}, 'increment')
  , h('button', {actions: {click: ['add', [idx, -1]]}}, 'decrement')
  , h('button', {actions: {click: ['add', [idx, -count]]}}, 'reset')
  ])
}

// Responsible for keeping a list of counters
function CounterList (addCounter$, add$) {
  stream.log(add$, 'add$')
  const count$ = stream.scanMerge([
    [addCounter$, (counters, _) => counters.concat([0])]
  , [add$,        (counters, [idx, n]) => R.update(idx, counters[idx] + n, counters)]
  ], [])
  stream.log(count$, 'count$')
  return count$
}

const init = (actions) => CounterList(actions('addCounter'), actions('add'))
const container = document.createElement('div')
document.body.appendChild(container)
var vnode$ = render(init, view, [], container)

stream.map(() => console.log("PATCHING"), vnode$)

test('renderrr', () => {
})
