const R = require('ramda')
const createElm = require('../html')
const stream = require('../stream')
const map = R.addIndex(R.map)


// UI logic for a single counter
const Counter = initial => ({increment, decrement, reset}) =>
 stream.scanMerge([
    [increment, applyToCount(R.add(1))]
  , [decrement, applyToCount(R.add(-1))]
  , [reset,     applyToCount(R.multiply(0))]
  ], createCount(initial)
)
var id = 0
const createCount = count => ({count, id: id++})
const applyToCount = fn => count => R.assoc('count', fn(count.count), count)

// UI logic for multiple counters
const CounterList = initial => ({add, rem}) =>
  stream.scanMerge([
    [add, appendCounter]
  , [rem, removeCounter]
  ], initial.map(c => stream.model(Counter(c))))

// Remove a specific counter based on its index
const removeCounter = (cs, ev) => {
  const id = Number(ev.currentTarget.parentNode.id)
  const idx = R.findIndex(c => c.output().id === id, cs)
  return R.remove(idx, 1, cs)
}

// Add a new Counter instance to a list of counters from a form submit
const appendCounter = (cs, ev) => {
  ev.preventDefault()
  const form = ev.currentTarget
  const initial = Number(form.querySelector('input').value)
  const counter = stream.model(Counter(initial))
  return R.append(counter, cs)
}

// Views and DOM generation:

const counterView = counterList => counter => {
  return {
    tag: 'div'
  , props: {id: stream.map(R.prop('id'), counter.output)}
  , children: [
      'Current count is '
    , stream.map(R.prop('count'), counter.output)
    , btn(counter.input.increment, 'Increment')
    , btn(counter.input.decrement, 'Decrement')
    , btn(counter.input.reset, 'Reset')
    , btn(counterList.input.rem, 'Remove')
    ]
  }
}

const btn = (input, text) => {
  return {
    tag: 'button'
  , on: {click: input}
  , children: [text]
  }
}

const view = counterList => {
  // counterList.output is a stream of arrays of counter model instances
  // we map over each model instance and apply counterView to it
  const counterViews = stream.map(R.map(counterView(counterList)), counterList.output)
  return {
    tag: 'div'
  , children: [
      addForm(counterList)
    , {tag: 'div', children: counterViews}
    ]
  }
}

const addForm = counterList => {
  return {
    tag: 'form'
  , on: {submit: counterList.input.add}
  , children: [
      {tag: 'button', children: ['Add Counter']}
    , {tag: 'input', props: {type: 'number', value: 0}}
    ]
  }
}

const render = () => {
  const vtree = view(stream.model(CounterList([1,2,3,4])))
  const elm = createElm(vtree)
  document.body.appendChild(elm)  
}
render()
