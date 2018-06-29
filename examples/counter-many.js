const {component, system, collection, h} = require('../systems')

// Basic counter component
const counter = system({
  total: component({
    state: {count: 0},
    receive: {
      add: (n, {count}) => ({count: count + n})
    }
  })
}, ({total}, send) => {
  return h('div', [
    h('p', ['Count: ', total.state.count]),
    h('button', {on: {click: () => send('add', 1)}}, 'Increment'),
    h('button', {on: {click: () => send('add', -1)}}, 'Decrement')
  ])
})

// Wrap a counter with a remove button
const counterWithRemove = system({
  counter: counter
}, ({counter}, send) => {
  return h('div', [
    h('button', {on: {click: () => send('remove', counter.id)}}, 'Remove),
    counter.vnode
  ])
})

/*
const {h, component, debug} = require('../')

var id = 0
function Counter (initial = 0) {
  return component({
    state: {count: initial, id: id++},
    on: {
      ADD: function (val, state, emit) {
        state.count += val
        emit('UPDATE', state)
      },
      RESET: function (_, state, emit) {
        state.count = 0
        emit('UPDATE', state)
      }
    },
    view: function (state, emit) {
      return h('div', {
        key: state.id
      }, [
        h('p', ['Bean bag #', state.id]),
        h('p', ['Total beans: ', String(state.count)]),
        h('button', {on: {click: () => emit('ADD', 1)}}, 'add a bean'),
        h('button', {on: {click: () => emit('ADD', -1)}, props: {disabled: state.count === 0}}, 'toss a bean'),
        h('button', {on: {click: () => emit('RESET')}}, 'throw all beans in the garbage')
      ])
    }
  })
}

function CounterList (initial = []) {
  const totalCount = getTotal(initial)
  return component({
    state: {counters: initial || [], totalCount},
    on: {
      RESET_ALL: function (_, state, emit) {
        state.counters.forEach(function (counter) {
          counter.emit('RESET')
        })
        state.totalCount = 0
        emit('UPDATE', state)
      },
      APPEND: function (_, state, emit) {
        const newCounter = Counter(1)
        debug(newCounter, 'counter ' + newCounter.state.id)
        newCounter.on('ADD', function (val) {
          state.totalCount += val
          emit('UPDATE', state)
        })
        newCounter.on('RESET', function (val) {
          state.totalCount = getTotal(state.counters)
          emit('UPDATE', state)
        })
        state.counters.push(newCounter)
        state.totalCount += 1
        emit('UPDATE', state)
      },
      REMOVE: function (id, state, emit) {
        state.counters = state.counters.filter(c => c.state.id !== id)
        state.totalCount = getTotal(state.counters)
        emit('UPDATE', state)
      }
    },
    view: listView
  })
}

function getTotal (counters) {
  // Get the sum of all counters' count
  return counters.reduce((sum, c) => c.state.count + sum, 0)
}

function listView (state, emit) {
  return h('div', [
    h('p', ['Bean bag simulator 2000']),
    h('p', ['Total beans: ', state.totalCount]),
    h('div', [
      h('button', {
        on: {click: () => emit('RESET_ALL')},
        props: {disabled: state.totalCount === 0}
      }, 'Reset all'),
      h('button', {
        on: {click: () => emit('APPEND')}
      }, 'Add another bean bag'),
      h('div', state.counters.map(counter => counterViewWithRemove(state, emit, counter)))
    ])
  ])
}

function counterViewWithRemove (state, emit, counter) {
  const removeBtn = h('button', {
    on: {click: () => emit('REMOVE', counter.state.id)}
  }, ['Remove bag'])
  return h('div', {
    key: counter.state.id
  }, [
    h('hr'),
    h('input', {props: {type: 'checkbox'}}),
    counter.vnode,
    removeBtn
  ])
}

const list = CounterList([])
debug(list, 'list')

document.body.appendChild(list.node)
*/
