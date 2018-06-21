
function Tree (rootVal) {
  return {
    root: rootVal,
    children: {}
  }
}

const globalState = Tree(null)

module.exports = {emit, get, Component, globalState, updated, del}

// TODO double-splats ? eg. emit(['**', 'modal'], 'close')
// TODO remove component

function getTreePath (tree, path) {
  let node = tree
  for (let i = 0; i < path.length; ++i) {
    node = node.children[path[i]]
  }
  return node
}

function setTreePathVal (tree, path, val) {
  let node = tree
  for (let i = 0; i < path.length - 1; ++i) {
    if (!node.children[path[i]]) {
      node.children[path[i]] = Tree(null)
    }
    node = node.children[path[i]]
  }
  const last = path[path.length - 1]
  // if (node.children[last]) throw new Error('Scope already set: ' + path)
  node.children[last] = Tree(val)
}

const listeners = []

function updated (fn) {
  listeners.push(fn)
}

function emit (scope, event, data) {
  if (!Array.isArray(scope) || !scope.length) {
    throw new TypeError('The scope argument should be a non-empty array')
  }
  if (!event || !event.length) {
    throw new TypeError('The event argument should be a non-empty string')
  }
  let multiple = false
  if (hasSplat(scope)) {
    scope = scope.slice(0, scope.length - 1)
    multiple = true
  }
  let node = getTreePath(globalState, scope)
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
  return scope[scope.length - 1] === '*'
}

function get (scope) {
  if (!Array.isArray(scope) || !scope.length) {
    throw new TypeError('The scope argument should be a non-empty array')
  }
  let getMany = false
  if (scope[scope.length - 1] === '*') {
    getMany = true
    scope = scope.slice(0, scope.length - 1)
  }
  let node = getTreePath(globalState, scope)
  if (getMany) {
    const children = Object.values(node.children)
    return children.map(n => n.root).map(r => r.state)
  } else {
    return node.root.state
  }
}

function del (scope) {
  // delete in global state
  setTreePathVal(globalState, scope, null)
}

function Component (options = {}) {
  if (!Array.isArray(options.scope) || !options.scope.length) {
    throw new TypeError('The .scope property should be a non-empty array')
  }
  const emitter = {
    handlers: {},
    emit: function (eventName, data) {
      this.handlers[eventName](data)
    }
  }
  if (!options.state || typeof options.state !== 'object') {
    throw new TypeError('The .state property must be an object')
  }
  let component = {
    state: options.state,
    emitter: emitter,
    scope: options.scope
  }
  setTreePathVal(globalState, component.scope, {emitter, state: component.state})

  const on = options.on || {}
  for (let eventName in on) {
    emitter.handlers[eventName] = function (data) {
      const result = on[eventName](data, component)
      if (result !== undefined) {
        component.state = Object.assign(component.state, result)
        listeners.forEach(fn => fn({eventName, component}))
      }
    }
  }

  return component.state
}
