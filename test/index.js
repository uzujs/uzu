// Test the top-level Component constructor
const h = require('../h')
const Component = require('..')
const test = require('tape')

function Counter (start = 0) {
  return Component({
    state: { count: start },
    events: {
      INCR: ({ state }) => ({ count: state.count + 1 })
    },
    view: function ({ state, emitter }) {
      return h('div', [
        h('button', {
          on: { click: () => emitter.emit('INCR') }
        }, 'Count is ' + state.count)
      ])
    }
  })
}

test('counter basic functionality', function (t) {
  const counter = Counter(-1)
  t.strictEqual(counter.vnode.elm.textContent, 'Count is -1')
  t.deepEqual(counter.state, { count: -1 })
  counter.emitter.emit('INCR')
  t.deepEqual(counter.state, { count: 0 })
  t.strictEqual(counter.vnode.elm.textContent, 'Count is 0')
  // Test that an actual dom event updates state
  counter.vnode.elm.firstChild.click()
  t.deepEqual(counter.state, { count: 1 })
  t.strictEqual(counter.vnode.elm.textContent, 'Count is 1')
  // Nonexistent action is a no-op
  t.throws(() => counter.emitter.emit('NONEXISTENT_ACTION'))
  t.end()
})
