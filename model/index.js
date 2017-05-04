var R = require('ramda')
var stream = require('event-stream')

// convert an object containing streams into a stream of a single object without streams
// {Stream(x)..} -> Stream({x..})

module.exports = function model (obj) {
  var initial = R.clone(obj)
  // An array of streams of keynames from obj that get updated
  var keyStreams = []

  for (var key in obj) {
    if (isPlainObj(obj[key])) {
      obj[key] = model(obj[key])
    }
  }

  for (var key in obj) {
    if (isStream(obj[key])) {
      keyStreams.push( stream.always(key, obj[key]) )
      initial[key] = obj[key]()
    }
  }

  return stream.scan(set, initial, stream.merge(keyStreams))

  function set (data, key) {
    data[key] = obj[key]()
    return data
  }
}


function isStream (x) {
  return typeof x === 'function' && x.data
}

function isPlainObj (obj) {
  if (typeof obj === 'object' && obj !== null) {
    if (typeof Object.getPrototypeOf === 'function') {
      var proto = Object.getPrototypeOf(obj)
      return proto === Object.prototype || proto === null
    }
    return Object.prototype.toString.call(obj) == '[object Object]'
  }
  return false
}

