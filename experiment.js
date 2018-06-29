/**
 * Global trees 🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
 * TODO double-splats ? eg. emit(['**', 'modal'], 'close')
 * TODO remove component
 */

const mitt = require('mitt')
const emitter = mitt()

// Generic multi-child tree data structure
// Every node has a single value, possibly null
// Every child node has a string name (each key in the children obj)
function Tree (rootVal) {
  return {
    root: rootVal,
    children: {}
  }
}

window._uzu_globalTree = window._uzu_globalTree || Tree(null)
const globalTree = window._uzu_globalTree

function fetchInTree (tree, path) {
  // fetch a deeply nested value based on a path (array) in a tree
  let node = tree
  for (let i = 0; i < path.length; ++i) {
    node = node.children[path[i]]
  }
  return node
}

function setTreePathVal (tree, path, val) {
  // Set the value of a deeply nested node in a tree based on a path (array)
  // Initializes nodes as it goes
  let node = tree
  for (let i = 0; i < path.length; ++i) {
    if (!node.children[path[i]]) {
      node.children[path[i]] = Tree(null)
    }
    node = node.children[path[i]]
  }
  node.root = val
}

function emit (scope, event, data) {
  // Emit an event for some scope with some data
  if (!Array.isArray(scope) || !scope.length) {
    throw new TypeError('The scope argument should be a non-empty array')
  }
  if (!event || !event.length) {
    throw new TypeError('The event name should be a non-empty string')
  }
  let multiple = false
  if (hasSplat(scope)) {
    scope = scope.slice(0, scope.length - 1)
    multiple = true
  }
  let node = fetchInTree(globalTree, scope)
  if (!node || !node.root) {
    throw new Error('Unknown scope: ' + scope)
  }
  if (multiple) {
    const children = Object.values(node.children)
    children.map(n => n.root).map(r => r.emitter).forEach(e => {
      e.emit(event, data)
    })
  } else {
    node.root.emitter.emit(event, data)
  }
}

function hasSplat (scope) {
  // Does a scope end in a star? (eg. ['person', '*'])
  return scope[scope.length - 1] === '*'
}

function get (scope) {
  // Fetch data for some scope
  if (!Array.isArray(scope) || !scope.length) {
    throw new TypeError('The scope argument should be a non-empty array')
  }
  let getMany = false
  if (scope[scope.length - 1] === '*') {
    getMany = true
    scope = scope.slice(0, scope.length - 1)
  }
  let node = fetchInTree(globalTree, scope)
  if (getMany) {
    if (node === undefined) return []
    const children = Object.values(node.children)
    return children.map(n => n.root).map(r => r.state)
  } else {
    if (node === undefined) return null
    return node.root.state
  }
}

function getEmitterName (scope, eventName) {
  // From a scope and event name, produce a single string for use in the global emitter
  return scope.join(':') + ':' + eventName
}

function handle (scope, eventName, callback) {
  if (hasSplat(scope)) {
  }
  const emitterName = getEmitterName(scope, eventName)
  emitter.on(emitterName, callback)
}

function del (scope) {
  // Delete a scope, including all state, handlers, and child data
  const lastEntry = scope[scope.length - 1]
  const parentNode = fetchInTree(globalTree, scope.slice(0, -1))
  delete parentNode.children[lastEntry]
  // TODO call emitter.off for every emitter on this scope
}

function component (options = {}) {
  // Create a component which sets data in global state and saves an event handler
  if (!Array.isArray(options.scope) || !options.scope.length) {
    throw new TypeError('The .scope property should be a non-empty array')
  }
  if (!options.state || typeof options.state !== 'object') {
    throw new TypeError('The .state property must be an object')
  }
  const emitter = {
    handlers: {},
    emit: function (eventName, data) {
      this.handlers[eventName](data)
    }
  }
  const component = {
    state: options.state,
    emitter: emitter,
    scope: options.scope
  }
  // Set the emitter and state in the global tree
  setTreePathVal(globalTree, component.scope, {emitter, state: component.state})

  // Initialize event handler functions
  const on = options.on || {}
  on.merge = obj => obj
  for (let eventName in on) {
    emitter.handlers[eventName] = function (data) {
      const result = on[eventName](data, component.state)
      if (result !== undefined) {
        // Re-assign a new object as the state
        component.state = Object.assign(component.state, result)
        // Call any event listeners
        emitter.emit(getEmitterName(component.scope, eventName), data)
      }
    }
  }

  return component.state
}

module.exports = {emit, get, component, del, handle}
