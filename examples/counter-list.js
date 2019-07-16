const { stateful, h } = require('..')
const mitt = require('mitt')

module.exports = { Counter }

// Increment the count for a Counter instance
function incrCounter (counter) {
  counter._store.count += 1
  counter._store.emitter.emit('count')
  counter._render()
}

function Counter (start = 0) {
  return stateful({
    count: start,
    emitter: mitt()
  }, (counter) => {
    return h('div', [
      h('button', {
        on: { click: () => incrCounter(counter) }
      }, 'Count is ' + counter._store.count)
    ])
  })
}

// Append a new counter to a list of counters wrapped with an ID
function appendCounter (list) {
  const c = Counter(0)
  // Re-render the parent to re-calculate counter totals
  c._store.emitter.on('count', () => list._render())
  const id = String(Math.random() * 100000)
  list._store.counters.push({ id, c })
  list._render()
}

// Filter out any counters from a list with the given ID
function removeCounter (list, _id) {
  list._store.counters = list._store.counters.filter(({ c, id }) => id !== _id)
  list._render()
}

function CounterList () {
  return stateful({
    counters: []
  }, (list) => {
    const total = list._store.counters.reduce((sum, { c }) => sum + c._store.count, 0)
    return h('div', [
      h('p', ['Total count is ', total]),
      h('button', {
        on: { click: () => appendCounter(list) }
      }, 'append counter'),
      h('div', list._store.counters.map(({ c, id }) => {
        return h('div', { key: id }, [
          c,
          h('button', {
            on: { click: () => removeCounter(list, id) }
          }, 'remove counter')
        ])
      }))
    ])
  })
}

const list = CounterList()
document.body.appendChild(list.elm)
