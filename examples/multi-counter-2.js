const R = require('ramda')
const stream = require('../stream')
const h = require('../html')

 
// UI logic for a single counter
const keepCount = initial => ({inc, dec, reset}) =>
  stream.scanMerge([
    [inc, R.add(1)]
  , [dec, R.add(-1)]
  , [reset,     R.always(0)]
  ], initial)

// UI logic for multiple counters
const listCounters = initial => ({add, rem}) =>
  stream.scanMerge([
    [add, cs => R.append(stream.model(keepCount(0)), cs)]
  , [rem, R.init]
  ], initial.map(c => stream.model(keepCount(c))))

// Counter component
const counterView = (counter) =>
  h('div', {}, [
    'Current count is '
  , counter.output
  , h('button', {on: {click: counter.input.inc}}, 'Increment')
  , h('button', {on: {click: counter.input.dec}}, 'Decrement')
  , h('button', {on: {click: counter.input.reset}}, 'Reset')
  ])

// Top level view function
const counterListView = list => {
  const counterViews = stream.map(R.map(counterView), list.output)
  return h('div', {}, [
    h('button', {on: {click: list.input.add}}, 'Add Counter')
  , h('div', {}, counterViews)
  , h('button', {on: {click: list.input.rem}}, 'Remove Counter')
  ])
}

// Initialize our data and render the views to the page
const render = (container) => {
  const list = stream.model(listCounters([1,2,3,4]))
  const div = counterListView(list)
  document.body.appendChild(div)
}

render()



