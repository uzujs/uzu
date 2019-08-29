const test = require('tape')

// Test the top-level Component constructor
const { stateful, h } = require('..')
const statechart = require('../statechart')

function Counter (start = 0) {
  const max = 3
  const chart = statechart('reset', {
    count: [{
      sources: ['reset', 'counting'],
      dest: 'counting',
      action: (counter) => {
        counter._store.count += 1
        counter._render()
        if (counter._store.count === max) {
          chart.finish(counter)
        }
      }
    }],
    reset: [{
      sources: ['counting', 'finished'],
      dest: 'reset',
      action: (counter) => {
        counter._store.count = 0
        counter._render()
      }
    }],
    finish: [{
      sources: ['counting'],
      dest: 'finished',
      action: (counter) => {
        counter._render()
      }
    }]
  })
  return stateful({ state: chart, count: start }, (counter) => {
    return h('div', [
      h('p', ['Count is ', counter._store.count]),
      h('button', {
        on: { click: () => counter._store.state.count(counter) }
      }, 'Count'),
      h('button', {
        on: { click: () => counter._store.state.reset(counter) }
      }, 'Reset')
    ])
  })
}

test('counter basic statechart functionality', function (t) {
  const counter = Counter(0)
  t.deepEqual(counter._store.count, 0)
  t.deepEqual(counter._store.state.current, 'reset')
  counter._store.state.count(counter)
  t.deepEqual(counter._store.count, 1)
  t.deepEqual(counter._store.state.current, 'counting')
  counter._store.state.count(counter)
  t.deepEqual(counter._store.count, 2)
  counter._store.state.count(counter)
  t.deepEqual(counter._store.count, 3)
  t.deepEqual(counter._store.state.current, 'finished')
  t.throws(() => counter._store.state.count(counter), Error, "Invalid action 'count' from state 'finished'")
  counter._store.state.reset(counter)
  t.deepEqual(counter._store.count, 0)
  t.deepEqual(counter._store.state.current, 'reset')
  t.throws(() => counter._store.state.rest(counter), Error, "Invalid action 'reset' from state 'reset")
  t.end()
})
