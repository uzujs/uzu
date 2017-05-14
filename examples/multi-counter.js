const stream = require('../stream')
const modelView = require('../modelView')
const h = require('../h')

const keepCount = ({increment, decrement, reset}) => {
  const add = stream.merge([
    stream.always(1, increment)
  , stream.always(-1, decrement)
  ])
  const count = stream.scanMerge([
    [add, (sum, n) => sum + n]
  , [reset, (sum, n) => 0]
  ], 0)
  return {count}
}

const counterView = ({count}) => {
  return h('div', {}, [
    'Current count is '
  , count
  , h('button', {streams: {click: 'increment'}}, 'increment')
  , h('button', {streams: {click: 'decrement'}}, 'decrement')
  , h('button', {streams: {click: 'reset'}}, 'reset')
  ])
}

const counter = modelView(keepCount, counterView)

const listCounters = ({addCounter, removeCounter}) => {
  const counters = stream.scanMerge([
    [addCounter, appendCounter]
  , [removeCounter, popCounter]
  ], [])
  return {counters}
}

// Utilities for listCounters model
const appendCounter = (counters) => {
  const component = modelView(keepCount, counterView)
  return counters.concat([component])
}

const popCounter = (counters) => {
  counters.pop()
  return counters
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

