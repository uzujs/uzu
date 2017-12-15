const test = require('tape')
const chart = require('../../statechart')

// TODO Add typescript defs
test.skip('it throws errors on malformed state arrays', t => {
  t.throws(() => { chart({ states: [], events: {}, initial: {} }) })
  t.throws(() => { chart({ states: null, events: {}, initial: {} }) })
  t.throws(() => { chart({ events: {}, initial: {} }) })
  t.throws(() => { chart({ states: 'state', events: {}, initial: {} }) })
  t.end()
})

// TODO Add typescript defs
test.skip('it throws errors on malformed event transitions', t => {
  t.throws(() => {
    chart({ states: ['s1'], events: ['s1', 's2'], initial: {} })
    chart({ states: ['s1'], events: {LOOP: [['s1', 'x1']]}, initial: {} })
  }, 'missing state name')
  t.throws(() => {
    chart({ states: ['s1'], events: 123, initial: {} })
  }, 'wrong type')
  t.throws(() => {
    chart({ states: ['s1'], events: {}, initial: {} })
  }, 'wrong type')
  t.throws(() => {
    chart({ states: ['s1'], events: {LOOP: ['s1']}, initial: {} })
  }, 'onlyu state')
  t.throws(() => {
    chart({ states: ['s1'], events: {LOOP: [{'s1': 's1'}]}, initial: {} })
  }, 'obj instead of arr')
  t.throws(() => {
    chart({ states: ['s1'], events: {LOOP: [['s1']]}, initial: {} })
  }, 'only one state')
  t.ok(() => {
    chart({ states: ['s1'], events: {LOOP: [['s1', 's1']]}, initial: {} })
    chart({ states: ['s1'], events: {LOOP: ['s1', 's1']}, initial: {} })
  })
  t.end()
})

test('it throws an error on ambiguous state transitions', t => {
  t.throws(() => {
    chart({ states: ['s1', 's2'], events: {AMBIG: [['s1', 's2'], ['s1', 's1']]}, initial: {} })
  }, 'throws ambiguity err')
  t.end()
})

test('it throws an error on an inaccessible state', t => {
  t.throws(() => {
    chart({ states: ['s1', 's2'], events: {NOPE: [['s1', 's1']]}, initial: {} })
  }, 'throws inaccessibility err')
  t.ok(() => {
    chart({ states: ['s1', 's2'], events: {NOPE: [['s1', 's2']]}, initial: {} })
  }, 'ok when a state is only a dest')
  t.end()
})

test('it throws an error if an event transitions to a missing state', t => {
  t.throws(() => {
    chart({ states: ['s1'], events: {NOPE: ['s1', 's2']}, initial: {} })
  }, 'throws inaccessibility err')
  t.end()
})

test('gives a new correct state on a transition event', t => {
  const s = chart({states: ['s1', 's2'], events: {EV: ['s1', 's2']}, initial: {s1: true}})
  t.assert(s.value.s1)
  t.notOk(s.value.s2)
  s.event('EV')
  console.log('s.value', s.value)
  t.assert(s.value.s2)
  t.notOk(s.value.s1)
  t.end()
})

test('transitions correctly on loops', t => {
  const loop = chart({states: ['s1'], events: {EV: ['s1', 's1']}, initial: {s1: true}})
  loop.event('EV')
  t.assert(loop.value.s1)
  t.assert(loop.value.s1)
  t.end()
})

test('it throws an error when transitioning from a blank initial state', t => {
  const loop = chart({states: ['s1'], events: {EV: ['s1', 's1']}, initial: {}})
  t.throws(() => loop.event('EV'))
  t.end()
})
