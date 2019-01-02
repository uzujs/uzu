var mitt = require('mitt')
var patch = require('snabbdom').init([
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/dataset').default,
  require('snabbdom/modules/attributes').default
])

module.exports = Component
var id = 0

// Create a new component from a set of options
// Props in options:
//   .state - optional (defaults to {}) - object
//   .events - optional (defaults to {}) - object - event handler functions
//   .view - required - function - snabbdom view function (must return snabbdom vtree)
// Props in the returned object:
//   .id - number - unique sequential id of the component (eg. useful for the "key" property in the vnode)
//   .state - object - matches state passed in options and updates from events
//   .emitter - event emitter (using mitt, with .on, .off, .emit methods)
//   .vnode - snabbdom virtual dom node (return value of the view)
function Component (options) {
  var component = {
    id: id++,
    state: options.state || {},
    events: options.events || {},
    emitter: mitt() // Event emitter via mitt (has .emit, .on, and .off)
  }
  // Every component has a generic 'UPDATE' event that does a simple state merge.
  // This can also be used to force a re-render on the component, if needed.
  component.events['UPDATE'] = (_, newState) => newState
  // Handle events by running events and re-rendering the view
  component.emitter.on('*', function (name, data) {
    // Find a handler that matches this event name
    var action = component.events[name]
    if (!action) {
      throw new Error('Unknown action: ' + name)
    }
    var newState = action(component, data)
    // Merge the return value, if present
    if (newState && typeof newState === 'object') {
      component.state = Object.assign(component.state, newState)
    }
    render(component, options.view)
    return component
  })
  component.vnode = patch(document.createElement('div'), options.view(component))
  return component
}

// Render the component with a little sub-tree patching, which makes it so you
// don't have to diff the entire vtree for the whole page, making updates very fast.
function render (component, view) {
  var newVnode = patch(component.vnode, view(component))
  for (var prop in newVnode) {
    if (component.vnode.hasOwnProperty(prop)) {
      component.vnode[prop] = newVnode[prop]
    }
  }
}
