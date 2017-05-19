const R = require('ramda')
const stream = require('../stream')
const {modelView, h} = require('../html')

// Apply a stream of functions to an accumulator
const scanApply = stream.scan((acc, fn) => fn(acc))
 
// UI logic for a single counter
const keepCount = ({increment, decrement, reset}) => {
  const funcs = stream.merge([
    stream.always(R.add(1), increment)
  , stream.always(R.add(-1), decrement)
  , stream.always(R.multiply(0), reset)
  ])
  return {
    count: scanApply(0, funcs)
  }
}

// Markup for a single counter
const counterView = ({count}) => {
  return h('div', {}, [
    'Current count is '
  , count
  , h('button', {streams: {click: 'increment'}}, 'increment')
  , h('button', {streams: {click: 'decrement'}}, 'decrement')
  , h('button', {streams: {click: 'reset'}}, 'reset')
  ])
}

// UI logic for multiple counters
const listCounters = ({addCounter, removeCounter}) => {
  const updates = stream.merge([
    stream.always(appendCounter, addCounter)
  , stream.always(R.init, removeCounter)
  ])
  return {
    counters: scanApply([], updates)
  }
}

// Utilities for listCounters model
const appendCounter = (counters) => {
  const component = modelView(keepCount, counterView)
  return counters.concat([component])
}

// Main view for counter list
const view = ({counters}) => {
  return h('div', {}, [
    h('button', {streams: {click: 'addCounter'}}, 'Add Counter')
  , h('div', {}, counters)
  , h('button', {streams: {click: 'removeCounter'}}, 'Remove Counter')
  ])
}

const {streams, elm} = modelView(listCounters, view)
document.body.appendChild(elm)

