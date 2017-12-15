module.exports = Channel

function Channel (value) {
  var chan = {value, listeners: []}
  if (arguments.length > 0) {
    chan.lastUpdated = Date.now()
  }

  chan.send = function send (value) {
    chan.value = value
    chan.lastUpdated = Date.now()
    for (var i = 0; i < chan.listeners.length; ++i) {
      chan.listeners[i](value)
    }
    return chan
  }

  chan.listen = function listen (callback) {
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

  return chan
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
