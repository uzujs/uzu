// Use all useful snabbdom modules
const patch = require('snabbdom').init([
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/dataset').default,
  require('snabbdom/modules/attributes').default
])
const h = require('snabbdom/h').default
const mitt = require('mitt')

module.exports = { Component, h }

// Create a new UI component
// opts is an object that can have these props:
//   - `data` - arbitrary data for the component
//   - `view` - function that returns a snabbdom vnode
//   - `states` - list of valid state machine states (element 0 is initial state)
//   - `transitions` - object of state machine transition events
function Component (opts) {
  if (typeof opts.view !== 'function') {
    throw new Error('Component missing a .view function')
  }
  const view = opts.view
  const actions = opts.actions || {}
  const transitions = opts.transitions || {}
  const initialState = transitions.initial
  delete transitions.initial
  // This object will be our ultimate return value
  const result = Object.assign({
    _viewArgs: [],
    _vnode: patch(document.createElement('div'), h('div')),
    _patched: false,
    _emitter: mitt(),
    state: initialState
  }, opts.data)
  // Wrap action functions
  for (let actName in actions) {
    const act = actions[actName]
    result[actName] = function () {
      const args = [result].concat(Array.from(arguments))
      act.apply(null, args)
      result._render()
      result._emitter.emit('action:' + actName, args)
    }
  }
  // Handle all state machine transitions
  for (let ev in transitions) {
    if (ev in actions) {
      throw new Error(`State transition "${ev}" has a name conflict with an action.`)
    }
    const trans = transitions[ev]
    result[ev] = function () {
      const args = [result].concat(Array.from(arguments))
      const matched = trans.filter(tran => {
        if (!tran.sources || !tran.sources.length) {
          throw new Error(`State transition "${ev}" missing a .sources array.`)
        }
        if (!tran.dest) {
          throw new Error(`State transition "${ev}" missing a .dest string.`)
        }
        // Current state must be in the transition sources array
        if (tran.sources.indexOf(result.state) === -1) {
          return false
        }
        // If the transition has a `when` predicate, it must be truthy
        if (tran.when && tran.when.apply(null, args)) {
          return false
        }
        return true
      })
      // Check if no state transitions matched the current conditions
      if (!matched.length) {
        throw new Error(`Invalid transition '${ev}' from state '${result.state}'`)
      }
      // Get the first transition match
      const tran = matched[0]
      if (typeof tran.action === 'function') {
        tran.action.apply(null, args)
      }
      const prev = result.state
      const current = tran.dest
      result.state = current
      result._render()
      result._emitter.emit('transition:' + ev, args)
      result._emitter.emit('state:' + current, prev)
    }
  }
  // Patch the vnode and DOM
  result._render = function () {
    const newVnode = patch(result._vnode, view.apply(null, [result].concat(result._viewArgs)))
    // Do some efficient subtree patching
    // Update the existing vnode object, rather than using a new one, so it updates in-place
    for (let prop in newVnode) {
      result._vnode[prop] = newVnode[prop]
    }
    return result._vnode
  }
  // Wrapped view function
  result.view = function () {
    if (arguments.length) {
      result._viewArgs = Array.from(arguments)
    }
    if (arguments.length || !result._patched) {
      result._render()
      result._patched = true
    }
    return result._vnode
  }
  return result
}
