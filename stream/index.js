const curryN = require('ramda/src/curryN')

const checkStreamType = (s, fnName) => {
  if (!isStream(s)) {
    throw new TypeError(`Non-stream value passed to ${fnName}: ` + s)
  }
}

// Create a new stream with an optional initial value
const create = val => {
  const data = {dependents: []}
  function Stream (val) {
    if (arguments.length === 0) return data.val
    update(data, val)
    return Stream
  }
  Stream.data = data
  Stream.__isStream = true
  if (arguments.length !== 0) Stream(val)
  return Stream
}

// Update stream data and all dependents with a new val
const update = (streamData, val) => {
  streamData.ts = performance.now()
  streamData.val = val
  streamData.dependents.forEach(fn => fn(val))
}

// Create a new stream with fn applied to all values within stream
const map = curryN(2, (fn, stream) => {
  checkStreamType(stream, 'map')
  const newS = create()
  const updater = val => newS(fn(val))
  stream.data.dependents.push(updater)
  if (hasVal(stream)) updater(stream())
  return newS
})

// Merge multiple streams into one, where each event on each streams fires separately in the result stream
const merge = streams => {
  const newS = create()
  for (var i = 0; i < streams.length; ++i) {
    checkStreamType(streams[i], 'merge')
    streams[i].data.dependents.push(newS)
    if (hasVal(streams[i])) newS(streams[i]())
  }
  return newS
}

// Scan all values in stream into a single rolling value
const scan = curryN(3, (fn, accum, stream) => {
  checkStreamType(stream, 'scan')
  const newS = create(accum)
  const updater = val => {
    accum = fn(accum, val)
    newS(accum)
  }
  if (hasVal(stream)) updater(stream())
  stream.data.dependents.push(updater)
  return newS
})

// Zip the values from many streams into a single stream of arrays of values
const zip = curryN(1, (streams) => {
  const newS = create()
  var accum = []
  const updater = val => {
    accum.push(val)
    if (accum.length === streams.length) {
      newS(accum)
      accum = []
    }
  }
  for (var i = 0; i < streams.length; ++i) {
    checkStreamType(streams[i], 'zip')
    streams[i].data.dependents.push(updater)
    if (hasVal(streams[i])) updater(streams[i]())
  }
  return newS
})

// Collect values from a stream into an array, and emit that array as soon as n values have been collected
const buffer = curryN(2, (n, stream) => {
  checkStreamType(stream, 'buffer')
  const newS = create()
  var buff = []
  stream.data.dependents.push(val => {
    buff.push(val)
    if(buff.length === n) {
      newS(buff)
      buff = []
    }
  })
  return newS
})

// Filter values out of a stream using a predicate
const filter = curryN(2, (fn, stream) => {
  checkStreamType(stream, 'filter')
  const newS = create()
  const updater = val => {
    if (fn(val)) newS(val)
  }
  stream.data.dependents.push(updater)
  if (hasVal(stream)) updater(stream())
  return newS
})

// Scan and merge several streams into one, starting with an initial value
const scanMerge = curryN(2, (streams, accum) => {
  const newS = create(accum)
  for (var i = 0; i < streams.length; ++i) {
    const [s, fn] = streams[i]
    checkStreamType(s, 'scanMerge')
    s.data.dependents.push(val => {
      accum = fn(accum, val)
      newS(accum)
    })
  }
  return newS
})

// Create a stream that has val every time 'stream' emits anything
const always = curryN(2, (val, stream) => {
  checkStreamType(stream, 'always')
  return map(() => val, stream)
})

// Create a new stream whose immediate value is val
const defaultTo = curryN(2, (val, stream) => {
  checkStreamType(stream, 'defaultTo')
  const newS = create(val)
  stream.data.dependents.push(val => newS(val))
  return newS
})

// Log values on a stream for quick debugging
const log = (annotation, stream) => {
  checkStreamType(stream, 'log')
  stream.data.dependents.push(x => console.log(annotation, x))
  return stream
}

// Map over a stream, where fn returns a nested stream. Flatten into a single-level stream
const flatMap = curryN(2, (fn, stream) => {
  checkStreamType(stream, 'flatMap')
  const newS = create()
  const updater = val => {
    const innerStream = fn(val)
    checkStreamType(innerStream, 'flatMap inner')
    if (hasVal(innerStream)) newS(innerStream())
    map(val => newS(val), innerStream)
  }
  stream.data.dependents.push(updater)
  if (hasVal(stream)) updater(stream())
  return newS
})

// -- Time-related
//

// Emit a timestamp every ms until maxMs
const every = (ms, endStream) => {
  const newS = create()
  var target = Number(new Date())
  function timer() {
    const now = Number(new Date())
    target += ms
    if(endStream() === undefined) {
      newS(now)
      setTimeout(timer, target - now)
    }
  }
  timer()
  return newS
}

// Create a stream that emits values from 'stream' after a ms delay
const delay = (ms, stream) => {
  checkStreamType(stream, 'delay')
  const newS = create()
  const updater = val => setTimeout(() => newS(val), ms)
  stream.data.dependents.push(updater)
  return newS
}

// Only emit values from a stream at most every ms
// After an ms delay when the first value is emitted from the source stream, the new stream then emits the _latest_ value from the source stream
const throttle = curryN(2, (ms, stream) => {
  checkStreamType(stream, 'throttle')
  var timeout
  const newS = create()
  const updater = () => {
    if (!timeout) {
      timeout = setTimeout(() => { timeout = null ; newS(stream()) }, ms)
    }
  }
  stream.data.dependents.push(updater)
  return newS
})

// Create a stream that emits values from 'stream' after ms of silence
const afterSilence = (ms, stream) => {
  checkStreamType(stream, 'afterSilence')
  const newS = create()
  var timeout
  const updater = val => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => newS(stream()), ms)
  }
  stream.data.dependents.push(updater)
  return newS
}

const fromEvent = (event, node) => {
  const s = create()
  node.addEventListener(event, s)
  return s
}

const hasVal = stream => isStream(stream) && stream.data.ts !== undefined && stream.data.val !== undefined

const isStream = (x) => typeof x === 'function' && x.__isStream

module.exports = {create, map, merge, scan, buffer, filter, scanMerge, defaultTo, always, flatMap, delay, every, throttle, afterSilence, isStream, log, fromEvent, zip}

