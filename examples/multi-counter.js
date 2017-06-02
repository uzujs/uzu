const R = require('ramda')
const stream = require('../stream')
const h = require('../html')

 
// UI logic for a single counter
const keepCount = ({increment, decrement, reset}) =>
 stream.scanMerge([
    [increment, R.add(1)]
  , [decrement, R.add(-1)]
  , [reset,     R.always(0)]
  ], 0)


// Counter component
const counter = () => {
  const incBtn = h('button', {}, 'Increment')
  const decBtn = h('button', {}, 'Decrement')
  const resetBtn = h('button', {}, 'Reset')
  const increment = stream.fromEvent('click', incBtn)
  const decrement = stream.fromEvent('click', decBtn)
  const reset = stream.fromEvent('click', resetBtn)

  const count = keepCount({increment, decrement, reset})

  return h('div', {}, [
    'Current count is '
  , count
  , incBtn
  , decBtn
  , resetBtn
  ])
}

// UI logic for multiple counters
const listCounters = ({clickAdd, clickRem}) =>
  stream.scanMerge([
    [clickAdd, (cs) => cs.concat([counter()])]
  , [clickRem, R.init]
  ], [])


// Main component
const component = () => {
  const addBtn = h('button', {}, 'Add Counter')
  const clickAdd = stream.fromEvent("click", addBtn)
  const remBtn = h('button', {}, 'Remove Counter')
  const clickRem = stream.fromEvent("click", remBtn)
  const counters = listCounters({clickAdd, clickRem})

  return h('div', {}, [
    addBtn
  , h('div', {}, counters)
  , remBtn
  ])
}

document.body.appendChild(component())

