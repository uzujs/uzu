const state = require('../')
const test = require('tape')
const catchListeners = require('../lib/catch-listeners')

// Other tests for sub-modules
require('./dom')

test('initializing state sets properties', t => {
  const s = state({x: 1, y: 'a'})
  t.strictEqual(s.x, 1)
  t.strictEqual(s.y, 'a')
  t.end()
})

test('updating properties changes them and emits prop events', t => {
  var sum = 0
  const s = state({x: 1})
  s.on('x', x => { sum += x })
  s.update({x: 99})
  t.strictEqual(sum, 100)
  t.end()
})

test('updating properties that are not present in the state throws in error', t => {
  const s = state({x: 1})
  t.throws(() => s.update({y: 2}))
  t.end()
})

test('listening to an undefined property throws an err', t => {
  const s = state({x: 1})
  s.on('x', () => { return 'hi' })
  t.throws(() => s.on('y', () => { return 'hi' }))
  t.end()
})

test('we can catch any and all listeners bound to multiple states', t => {
  const s1 = state({x: 1})
  const s2 = state({y: 1})
  const listeners = catchListeners(() => {
    s1.on('x', x => { return 'hi' })
    s2.on('y', x => { return 'hi' })
  })
  t.strictEqual(listeners.length, 2)
  t.strictEqual(listeners[0].eventName, 'update:x')
  t.strictEqual(listeners[1].eventName, 'update:y')
  t.end()
})
