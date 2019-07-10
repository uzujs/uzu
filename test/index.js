const test = require('tape')

// Test the top-level Component constructor
const h = require('snabbdom/h').default
const { Component } = require('..')

function Counter (start = 0) {
  return Component({
    data: {
      count: start
    },
    actions: {
      incr (counter) {
        counter.count += 1
      }
    },
    view (counter) {
      return h('div', [
        h('button', {
          on: { click: () => counter.incr() }
        }, 'Count is ' + counter.count)
      ])
    }
  })
}

test('counter basic functionality', function (t) {
  const counter = Counter(-1)
  t.deepEqual(counter.count, -1)
  // Initial render
  counter.view()
  t.strictEqual(counter._vnode.elm.textContent, 'Count is -1')
  // Cause a state update and re-render
  counter.incr()
  t.deepEqual(counter.count, 0)
  t.strictEqual(counter._vnode.elm.textContent, 'Count is 0')
  // Test that an actual dom event updates state
  counter._vnode.elm.firstChild.click()
  t.deepEqual(counter.count, 1)
  t.strictEqual(counter._vnode.elm.textContent, 'Count is 1')
  t.end()
})
