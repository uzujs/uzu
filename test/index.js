const {h, component, debug} = require('..')
const test = require('tape')

// helper component
function Counter () {
  return component({
    state: 0,
    on: {
      ADD: (val, state, emit) => {
        emit('UPDATE', state + val)
      }
    },
    view: (state, emit) => {
      return h('button', {
        on: {click: () => emit('ADD', 1)}
      }, state)
    }
  })
}

test('counter emit', t => {
  const counter = Counter()
  debug(counter)
  t.strictEqual(counter.state, 0, 'initial state')
  counter.emit('ADD', 2)
  t.strictEqual(counter.state, 2, 'updates state')
  t.end()
})

test('counter dom event', t => {
  const counter = Counter()
  const click = new Event('click') // eslint-disable-line
  counter.node.dispatchEvent(click)
  t.strictEqual(counter.state, 1, 'updates state')
  t.strictEqual(counter.node.textContent, '1', 'updates dom node')
  t.end()
})

test('counter unknown event name', t => {
  const counter = Counter()
  t.throws(() => counter.emit('XYZ'), 'unknown event should throw')
  t.end()
})

test('counter overwrite update event', t => {
  const counter = Counter()
  t.throws(() => counter.on('UPDATE', () => 1), 'overwriting UPDATE should throw')
  t.end()
})

test('counter overwrite update event 2', t => {
  t.throws(() => {
    component({
      state: 0,
      on: {
        UPDATE: () => {}
      },
      view: (state, emit) => {
        return h('button', {
          on: {click: () => emit('ADD', 1)}
        }, state)
      }
    })
  }, 'overwriting UPDATE should throw')
  t.end()
})

test('params', t => {
  t.throws(() => component())
  t.throws(() => component({}))
  t.throws(() => component({view: 'x'}))
  t.throws(() => component({view: () => {}}))
  t.ok(component({view: () => h('div')}))
  t.throws(() => component({view: () => h('div'), on: 'x'}))
  t.end()
})

test('undefined initial state is ok', t => {
  const c = component({view: () => h('div'), on: {}})
  t.strictEqual(c.state, undefined)
  c.emit('UPDATE', 'hi')
  t.strictEqual(c.state, 'hi')
  t.end()
})
