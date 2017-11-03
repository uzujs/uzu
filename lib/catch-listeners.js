
// Catch all the event emitter listeners that get created during a function call
// This is useful for saving and removing listeners for dom.childSync and dom.route

module.exports = function catchListeners (fn) {
  var listeners = []
  var prevFn = window.__uzu_onBind
  window.__uzu_onBind = function (emitter, eventName, handler) {
    listeners.push({eventName: eventName, emitter: emitter, handler: handler})
    if (prevFn) prevFn(emitter, eventName, handler) // compose with any existing callback
  }
  fn()
  window.__uzu_onBind = prevFn
  return listeners
}
