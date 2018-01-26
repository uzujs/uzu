const channel = require('../')
const test = require('tape')

test('initializing channel sets properties', t => {
  const s = {x: channel(1), y: channel('a')}
  t.strictEqual(s.x.value, 1)
  t.strictEqual(s.y.value, 'a')
  t.end()
})

test('updating channels emits events', t => {
  var sum = 0
  const s = {x: channel(1)}
  s.x.listen(x => { sum += x })
  s.x.send(99)
  t.strictEqual(sum, 100)
  t.end()
})

test('we can catch any and all listeners bound to multiple model', t => {
  const s1 = {x: channel(1)}
  const s2 = {y: channel(1)}
  const unlisten = channel.createUnlistener(() => {
    s1.x.listen(x => { return 'hi' })
    s2.y.listen(y => { return 'hi' })
  })
  t.ok(unlisten)
  t.strictEqual(s1.x.listeners.length, 1)
  t.strictEqual(s2.y.listeners.length, 1)
  unlisten()
  t.strictEqual(s1.x.listeners.length, 0)
  t.strictEqual(s2.y.listeners.length, 0)
  t.end()
})

test('aggregate a channel of arrays of objects of channels', t => {
  const arr = channel([])
  const aggregate = channel.aggregate(arr)
  const chan1 = {name: channel('a')}
  const chan2 = {name: channel('x')}
  arr.send(arr.value.concat([chan1]))
  var results = []
  aggregate.name.listen(function ([name, prev]) {
    results.push(name)
    results.push(prev)
  })
  chan1.name.send('b')
  arr.send(arr.value.concat([chan2]))
  chan2.name.send('y')
  t.deepEqual(results, [ 'a', 'a', 'b', 'a', 'x', 'x', 'y', 'x' ])
  t.end()
})
