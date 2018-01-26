module.exports = Channel

function Channel (value) {
  if (!(this instanceof Channel)) return new Channel(value)
  this.listeners = []
  this.isChannel = true
  if (arguments.length > 0) {
    this.value = value
    this.lastUpdated = Date.now()
  }
  return this
}

Channel.listen = function (callback, chan) {
  chan.listeners.push(callback)
  if (chan.lastUpdated) {
    callback(chan.value)
  }
  if (creatingUnlistener) {
    var prevUnlistener = unlistener
    unlistener = function () {
      prevUnlistener()
      chan.listeners.pop()
    }
  }
}

Channel.prototype.listen = function (callback) {
  Channel.listen(callback, this)
}

Channel.send = function (value, chan) {
  chan.value = value
  chan.lastUpdated = Date.now()
  for (var i = 0; i < chan.listeners.length; ++i) {
    chan.listeners[i](value)
  }
  return chan
}

Channel.prototype.send = function (value) {
  Channel.send(value, this)
}

var unlistener = function () {}
var creatingUnlistener = false
Channel.createUnlistener = function (fn) {
  creatingUnlistener = true
  fn()
  creatingUnlistener = false
  var unlistenerCopy = unlistener
  unlistener = function () {}
  return unlistenerCopy
}

// Pass in an array of objects of channels
Channel.aggregate = function aggregate (arrayChan) {
  var result = {}
  arrayChan.listen(function (array) {
    array.forEach(function (obj) {
      if (!obj || typeof obj !== 'object' || obj.__aggregated__) return
      obj.__aggregated__ = true
      for (var name in obj) {
        // block scoping
        ;(function () {
          var thisName = name
          var chan = obj[name]
          if (chan && chan.isChannel) {
            var prev = chan.value
            if (!result[thisName]) result[thisName] = Channel(prev)
            chan.listen(function (value) {
              result[thisName].send([value, prev])
              prev = value
            })
          }
        })() // end block scope
      }
    })
  })
  return result
}
