const {component, system, h, render} = require('../systems')

// an output produces signals with data
// an input is a named connection going into a block
// a component has a state of changing values
// a component has outputs for each key in its state
// a wiring connects a specific output to a specific input for a specific block

const incr = output(1)
const decr = output(-1)
const sum = entity({
  initial: {sum: 0},
  inputs: {
    add: (n, {sum}) => ({sum: sum + n})
  }
})

const p = entity({
  initial: {view: h('p', '0')},
  inputs: {
    sum: (s) => h('p', s)
  }
})


// instead of directly wiring together
// all components send signals to a global bus
// signals have scopes
// you set the scope of a component when you connect it to the bus
//
// a view is a component that takes any input and outputs a node

// all components have input and output
// input and output are based on key labels

const sum = component({
  initial: {sum: 0},
  input: {
    add: (n, {sum}) => ({sum: sum + n})
  }
})

// Now for two sums, with a total counter

// a box can have:
// - type label
// - receiver label
// - sender label

belt.send({
  name: 'add',
  receiver: 0
})

function belt (belts) {
  belts.forEach(b => {
    if (!b || typeof b !== 'object') {
      throw new TypeError('Every belt should be an object: ' + b)
    }
    if (b.process) {
    }
  })

  while (true) {
  }
}

belt([
  {
    scope: ['sum', '*'],
    belt: sum
  },
  {
    belt: sum,
    inputs: {'sum:*:add', 'add'},
    outputs: {sum: 'totalSum'}
  }
])

--> sum:99:add, 1
   --> sum:99:sum, 1

// I send {
//   dest: 'doubleSum', id: 0,
//   contents: {
//     dest: 'add',
//     id: 1,
//     contents: 1
//   }
// }
// doubleSum receives it and sends down the line:
//   {
//     from: 'doubleSum', id: 0,
//     contents: {
//       
//     }
//   }

// Now for any amount of sums
//
// a signal is sent down with the label 'add' and contents {id, n}
// we want a signal sent along with label 'sum'

belt([
  {
    belt: sum,
    wrap: {
      add: {
      }
    }
  }
])

doubleSum.receive('*', (n, label) => {
  console.log(label)
})
doubleSum.send('add:1', 1)
// 'sum:1', 1
// 'totalSum', 1
doubleSum.send('add2', 1)
// 'sum:2', 1
// 'totalSum', 2
doubleSum.send('add:1', 1)
// 'sum:1', 2
// 'totalSum', 3



const bus1 = bus([
  sum0: sum,
  sum1: sum
])

const bus2 = bus([
  sums: bus1,
  total: {
    component: sum,
    splice: {
      'sums.add
    }
  }

// three components with the same ns connected
// if you send a signal with (['sum'], 'add', 1), down the bus, then all three will output {sum: 1}
bus.connect(sum, ['sum'])
bus.connect(sum, ['sum'])
bus.connect(sum, ['sum'])

bus.connect(sum, ['sum', 0])
bus.connect(sum, ['sum', 0])
bus.connect(sum, ['sum', 1])
bus.connect(sum, ['sum', 2])
// if you send a signal (['sum'], 'add', 1), none will be triggered
// you have to send (['sum', 0], 'add', 1)
// or (['sum', '*'], 'add', 1)
//
// now say we want to keep a running total of all counters under ['sum', '*']
// we can re-use the sum component
// we want it to sum on any signal like (['sum', '*'], 'sum')
//
// 
//
bus.connect(component, namespace, splice)

// if any signal fires on the bus for sum:*:add, then we add
bus.connect(sum, ['sumTotal'], [
  [['sum', '*', 'add'], ['add']]
])

// both 'sum:0' and 'sumTotal' get updated
bus.emit('sum:0:add')

// first, place components in the space w names
// then wire inputs 

// a system initializes a set of components
const counter = system({
  components: {
    add1: constant(1), sub1: constant(-1), sum
  },
  inputs: ['incr', 'decr'],
  outputs: {
    sum: 'sum.sum'
  },
  connections: {
    ['incr', 'add1'],
    ['decr', 'sub1'],
    ['add1', 'sum.add'],
    ['sub1', 'sum.add']
  }
})

view ({incr, decr, sum}) => {
  return h('button', {
    on: {click: incr},
    on: {click: decr}
  }, ['Count is ', sum])
}

// counter is a component with inputs incr, decr

const twoCounters = system({

})


const counter = system({
  incr: output(1),
  decr: output(-1),
  sum: component({
    state: {sum: 0},
    receive: {
      'add': (n, {sum}) => ({sum: sum + n})
    }
  })
}, ({incr, total}) => {
  return h('button', {
    events: {click: incr}
  }, ['Count: ', total.state.count])
})

const countComponent = component({
  state: {count: 0},
  receive: {
    add: (n, {count}) => ({count: count + n})
  }
})

const countView = ({total}, send) => {
  return h('div', [
    h('p', ['Count: ', total.state.count]),
    h('button', {on: {click: () => send('add', 1)}}, 'Increment'),
    h('button', {on: {click: () => send('add', -1)}}, 'Decrement')
  ])
}

const counter = system({
  total: countComponent
}, countView)

const twoCounters = system({
  c1: counter,
  c2: counter,
  total: component({
    state: {count: 0},
    receive: {
      'add': (n, {count}) => ({count: count + n})
    }
  })
}, ({c1, c2, total}, send) => {
  console.log({c1, c2, total, send})
  return h('div', [
    countView({total: c1}, send),
    countView({total: c2}, send),
    h('p', ['Total: ', total.state.count])
  ])
})

document.body.appendChild(twoCounters.init().node)
