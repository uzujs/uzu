const model = require('../model')
const test = require('tape')
const catchListeners = require('../lib/catch-listeners')

// Other tests for sub-modules
require('./dom')
require('./statechart')

test('initializing model sets properties', t => {
  const s = model({x: 1, y: 'a'})
  t.strictEqual(s.x, 1)
  t.strictEqual(s.y, 'a')
  t.end()
})

test('updating properties changes them and emits prop events', t => {
  var sum = 0
  const s = model({x: 1})
  s.on('x', x => { sum += x })
  s.update({x: 99})
  t.strictEqual(sum, 100)
  t.end()
})

test('updating properties that are not present in the model throws in error', t => {
  const s = model({x: 1})
  t.throws(() => s.update({y: 2}))
  t.end()
})

test('listening to an undefined property throws an err', t => {
  const s = model({x: 1})
  s.on('x', () => { return 'hi' })
  t.throws(() => s.on('y', () => { return 'hi' }))
  t.end()
})

test('we can catch any and all listeners bound to multiple model', t => {
  const s1 = model({x: 1})
  const s2 = model({y: 1})
  const listeners = catchListeners(() => {
    s1.on('x', x => { return 'hi' })
    s2.on('y', x => { return 'hi' })
  })
  t.strictEqual(listeners.length, 2)
  t.strictEqual(listeners[0].eventName, 'update:x')
  t.strictEqual(listeners[1].eventName, 'update:y')
  t.end()
})
