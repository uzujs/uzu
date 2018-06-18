const {h, component} = require('../')

var id = 0
function Counter (initial=0) {
  return component({
    state: {count: initial, id: id++},
    on: {
      ADD: function (val, state, emit) {
        emit('UPDATE', {count: state.count + val})
      },
      RESET: function (_, state, emit) {
        emit('UPDATE', {count: 0})
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

function CounterList (initial=[]) {
  const totalCount = getTotal(initial)
  return component({
    state: {counters: initial || [], totalCount},
    on: {
      RESET_ALL: function (_, state, emit) {
        state.counters.forEach(function (counter) {
          counter.emit('RESET')
        })
        emit('UPDATE', {totalCount: 0})
      },
      APPEND: function (_, state, emit) {
        const newCounter = Counter(1)
        newCounter.on('ADD', function (val) {
          emit('UPDATE', { totalCount: state.totalCount + val })
        })
        newCounter.on('RESET', function (val) {
          emit('UPDATE', { totalCount: getTotal(state.counters)})
        })
        emit('UPDATE', {
          counters: state.counters.concat([newCounter]),
          totalCount: state.totalCount + 1
        })
      },
      REMOVE: function (id, state, emit) {
        const counters = state.counters.filter(c => c.state.id !== id)
        emit('UPDATE', {
          counters: counters,
          totalCount: getTotal(counters)
        })
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


document.body.appendChild(CounterList([]).node)
