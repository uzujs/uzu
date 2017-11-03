var assert = require('assert')
var debug = require('debug')('uzu:dom')
var catchListeners = require('../lib/catch-listeners')

module.exports = {}

module.exports.childSync = function childSync (options) {
  assert.strictEqual(typeof options.view, 'function', 'pass in a function for the .view property')
  assert(options.container, 'pass in a .container property in options -- can be a string or HTMLElement')
  assert.strictEqual(typeof options.state, 'object', 'pass in a state object in the .state property')
  assert.strictEqual(typeof options.prop, 'string', 'pass in a property string in the .prop property')

  if (typeof options.container === 'string') options.container = document.createElement(options.container)
  var container = options.container
  var inserted = {} // track already-inserted dom nodes based on object id
  options.state.on(options.prop, update)

  function update () {
    var arr = options.state[options.prop]
    debug('updating dynamic children for dom.childSync: ' + arr)
    for (var i = 0; i < arr.length; ++i) {
      var elem = arr[i]
      if (!elem.hasOwnProperty('id')) {
        throw new TypeError('Each object in the array must have an "id" property')
      }
      var existing = inserted[elem.id]
      if (existing) {
        if (container.children[i] !== existing.dom) {
          debug('inserting existing child: ' + existing.dom)
          container.insertBefore(existing.dom, container.children[i])
        }
      } else {
        var newNode
        var listeners = catchListeners(function () {
          newNode = options.view(elem, i)
        })
        newNode.dataset['uzu_child_id'] = elem.id
        inserted[elem.id] = {dom: newNode, listeners: listeners}
        if (container.children[i]) {
          debug('inserting new child before existing elem: ' + newNode)
          container.insertBefore(newNode, container.children[i])
        } else {
          debug('appending new child: ' + newNode)
          container.appendChild(newNode)
        }
      }
    }
    // Remove any stragglers
    for (var j = arr.length; j < container.children.length; ++j) {
      var id = container.children[j].dataset['uzu_child_id']
      debug('removing child with id: ' + id)
      inserted[id].listeners.forEach(function (listener) {
        debug('removing listener for :' + listener.eventName)
        listener.emitter.removeListener(listener.eventName, listener.handler)
      })
      delete inserted[id]
      container.removeChild(container.children[j])
    }
  }
  return container
}

module.exports.route = function route (options) {
  assert.strictEqual(typeof options.state, 'object', 'pass in a state in the .state property')
  assert.strictEqual(typeof options.prop, 'string', 'pass in a property string in the .prop property')
  assert(options.container, 'pass in a .container property in options -- can be a string or HTMLElement')
  assert(typeof options.routes, 'object', 'pass in a routes object in the .routes property')

  debug('calling dom.route')
  if (typeof options.container === 'string') options.container = document.createElement(options.container)
  var listeners = []
  var prevPage = null
  options.state.on(options.prop, function (p) {
    if (p === prevPage) return
    prevPage = p
    listeners.forEach(function (listener) {
      debug('removing listener for: ' + listener.eventName)
      listener.emitter.removeListener(listener.eventName, listener.handler)
    })
    var child
    listeners = catchListeners(function () {
      child = options.routes[p]()
    })
    debug('appending new child for dom.route: ' + child)
    if (options.container.firstChild) options.container.removeChild(options.container.firstChild)
    options.container.appendChild(child)
  })
  return options.container
}
