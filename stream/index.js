const curryN = require('ramda/src/curryN')

// Create a new stream with an optional initial value
const create = val => {
  const data = {val, updaters: []}
  function Stream(val) {
    if(arguments.length === 0) return data.val
    update(data, val)
    return Stream
  }
  Stream.data = data
  return Stream
}

// Update stream data and all dependents with a new val
const update = (streamData, val) => {
  streamData.val = val
  streamData.updaters.forEach((updater) => updater(val))
}

// Create a new stream with fn applied to all values within stream
const map = curryN(2, (fn, stream) => {
  if(!isStream(stream)) throw new TypeError("Non-stream value passed to stream.map: " + stream)
  const newS = create()
  stream.data.updaters.push(val => newS(fn(val)))
  return newS
})

// Merge multiple streams into one, where each event on each streams fires separately in the result stream
const merge = streams => {
  const newS = create()
  for(var i = 0; i < streams.length; ++i) {
    streams[i].data.updaters.push(newS)
  }
  return newS
}

// Scan all values in stream into a single rolling value
const scan = curryN(3, (fn, accum, stream) => {
  const newS = create(accum)
  stream.data.updaters.push(val => {
    accum = fn(accum, val)
    newS(accum)
  })
  return newS
})

// Collect values from a stream into an array, and emit that array as soon as n values have been collected
const buffer = curryN(2, (n, stream) => {
  const newS = create()
  var buff = []
  stream.data.updaters.push(val => {
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
  const newS = create()
  stream.data.updaters.push(val => { if(fn(val)) newS(val) })
  return newS
})

// Scan and merge several streams into one, starting with an initial value
const scanMerge = curryN(2, (streams, accum) => {
  const newS = create(accum)
  for(var i = 0; i < streams.length; ++i) {
    const [s, fn] = streams[i]
    s.data.updaters.push(val => {
      accum = fn(accum, val)
      newS(accum)
    })
  }
  return newS
})

// Create a stream that has val every time 'stream' emits anything
const always = curryN(2, (val, stream) => map(() => val, stream))

// Create a new stream whose immediate value is val
const defaultTo = curryN(2, (val, stream) => {
  const newS = create(val)
  stream.data.updaters.push(val => newS(val))
  return newS
})

// Log values on a stream for quick debugging
const log = (stream, annotation) => {
  stream.data.updaters.push(x => console.log(annotation || '', x))
  return stream
}

// Map over a stream, where fn returns a nested stream. Flatten into a single-level stream
const flatMap = curryN(2, (fn, stream) => {
  const newS = create(stream())
  stream.data.updaters.push(elem => {
    var innerStream = fn(elem)
    var initialVal = innerStream()
    if(initialVal) newS(initialVal)
    map(val => newS(val), innerStream)
  })
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
  const newS = create()
  stream.data.updaters.push(val => {
    setTimeout(() => newS(val), ms)
  })
  return newS
}

// Only emit values from a stream at most every ms
// After an ms delay when the first value is emitted from the source stream, the new stream then emits the _latest_ value from the source stream
const throttle = curryN(2, (ms, stream) => {
  var timeout
  const newS = create()
  stream.data.updaters.push(() => {
    if(!timeout) {
      timeout = setTimeout(() => {
        timeout = null
        newS(stream())
      }, ms)
    }
  })
  return newS
})

// Create a stream that emits values from 'stream' after ms of silence
const afterSilence = (ms, stream) => {
  const newS = create()
  var timeout
  stream.data.updaters.push(val => {
    if(timeout) clearTimeout(timeout)
    timeout = setTimeout(() => newS(stream()), ms)
  })
  return newS
}

// Convert an object containing many streams into a single stream containing objects of static values
const object = (obj) => {
  var keyStreams = []
  var initial = {}

  for (var key in obj) {
    // Recurse on any nested objects
    if (isPlainObj(obj[key])) {
      obj[key] = object(obj[key])
    }
    // Create an aggregate stream that emits the object property name when the value stream emits anything
    // Clone all the initial data into a static object
    if (isStream(obj[key])) {
      keyStreams.push( always(key, obj[key]) )
      initial[key] = obj[key]()
    } else {
      initial[key] = obj[key]
    }
  }

  return scan((data, key) => {
    data[key] = obj[key]()
    return data
  }, initial, merge(keyStreams))
}

const isPlainObj = (obj) => {
  if (typeof obj === 'object' && obj !== null) {
    if (typeof Object.getPrototypeOf === 'function') {
      var proto = Object.getPrototypeOf(obj)
      return proto === Object.prototype || proto === null
    }
    return Object.prototype.toString.call(obj) == '[object Object]'
  }
  return false
}

const isStream = (x) =>
  typeof x === 'function' && x.name === 'Stream'

module.exports = {create, map, merge, scan, buffer, filter, scanMerge, defaultTo, always, flatMap, delay, every, throttle, afterSilence, object, isStream, log}

