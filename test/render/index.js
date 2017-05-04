const stream = require('../../../ev-stream/index.js')
const assert = require('assert')
const render = require('../../render')
const model = require('../../model')
const h = require('../../h')

function view (counters) {
  console.log('counters', counters)
  return h('div', [
    h('button', {streams: {click: 'addCounter'}}, 'Add Counter')
  , h('div', counters.all.map(viewCounter))
  ])
}

function viewCounter (count) {
  return h('div', [
    h('p', 'Total is ' + count.count)
  , h('button', {on: {click: count.actions.increment$}}, 'increment')
  , h('button', {streams: {click: {decrement: idx}}}, 'decrement')
  , h('button', {streams: {click: {reset: reset}}}, 'reset')
  ])
}

function init (dom) {
  return CounterList({
    increment$: dom('increment')
  , decrement$: dom('decrement')
  , reset$: dom('reset')
  , addCounter$: dom('addCounter')
  })
}

function CounterList (actions) {
  const {addCounter$} = actions
  const newCounter$ = stream.flatMap(() => Counter(actions), addCounter$)
  stream.map(ac => console.log({ac}), addCounter$)
  const all$ = stream.scan((all, c) => all.concat([c]), [], newCounter$)
  stream.map(counters => console.log({counters}), all$)
  return model({all: all$})
}

function Counter (actions) {
  const {increment$, decrement$, reset$} = actions
  const count$ = stream.scanMerge([
    [increment$, (c) => c + 1]
  , [decrement$, (c) => c - 1]
  , [reset$,     ()  => 0]
  ], 0)
  return model({count: count$})
}

const container = document.createElement('div')
document.body.appendChild(container)
var vnode$ = render(init, view, container)

stream.map(() => console.log("PATCHING"), vnode$)

test('renderrr', () => {
})
