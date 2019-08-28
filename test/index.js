const test = require('tape')

// Test the top-level Component constructor
const { stateful, h } = require('..')

require('./statechart')

function Counter (start = 0) {
  return stateful({ count: start }, (counter) => {
    return h('div', [
      h('button', {
        on: {
          click: () => {
            counter._store.count += 1
            counter._render()
          }
        }
      }, 'Count is ' + counter._store.count)
    ])
  })
}

test('counter basic functionality', function (t) {
  const counter = Counter(-1)
  t.deepEqual(counter._store.count, -1)
  // Initial render
  t.strictEqual(counter.elm.textContent, 'Count is -1', 'DOM couunt is -1')
  // Test that an actual dom event updates state
  counter.elm.firstChild.click()
  t.deepEqual(counter._store.count, 0, '_store.count is 0')
  t.strictEqual(counter.elm.textContent, 'Count is 0', 'DOM count is 0')
  // Test that an actual dom event updates state
  counter.elm.firstChild.click()
  t.deepEqual(counter._store.count, 1, '_store.count is 1')
  t.strictEqual(counter.elm.textContent, 'Count is 1', 'DOM count is 1')
  t.end()
})
