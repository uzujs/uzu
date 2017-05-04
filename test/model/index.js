const s = require('event-stream')
const model = require('../../model')
const assert = require('assert')

test('basic stream in obj', () => {
  const s1 = s.create()
  const m = model({s: s1})
  s1(1)
  assert.deepEqual(m().s, 1)
})

test('static vals', () => {
  const m = model({s: 1})
  assert.deepEqual(m().s, 1)
})

test('nested sterams', () => {
  const s1 = s.create()
  const m = model({nested: {s: s1}})
  s1(1)
  assert.deepEqual(m().nested.s, 1)
})

