# :cyclone: uzu :cyclone:

Uzu is a small, simple, and efficient library for creating UI components. It combines virtual DOM using [snabbdom](https://github.com/snabbdom/snabbdom) with a simple event emitter and state object.

Uzu encourages a "fractal component" style of architecture, where the UI is built up from many small, self-contained pieces. Components can easily communicate state and events with each other.

## Getting Started

The `h` function creates DOM elements while the `component` function wraps those elements with stateful, event-driven behavior.

The `h` function comes directly from [snabbdom](https://github.com/snabbdom/snabbdom). Reference the documentation there for its API. This library pre-initializes snabbdom with several plugins activated: `props`, `attributes`, `style`, `dataset`, `class`, and `eventlisteners`.

```js
const {h} = require('uzu')

const todoItem = h('div', {
  class: {finished: true}
}, [ 'Wash the dishes' ])
```

### Communicating among components

One of the most important aspects of UI is being able to easily allow data to flow between different parts of the page. 

#### Sibling to sibling

#### Children to parent

#### Parent to children



#### Globally

It's often helpful to keep a global state for your application that all compoents can reference, similar to a database on the backend.

You can still keep your components isolated and decoupled from any global state by adding wrapper code that syncs the component state with the global state.

In the below example, the "Dropdown" component is not coupled to any global state. When you initialize it, we add some code to keep its contents in sync with the global state from outside the component itself:

```js

const dropdown = Dropdown(globalState.get('users'))
globalState.on('update:users', users => {
  dropdown.emit('UPDATE_OPTIONS', users)
})
```

## API

### h(selector, options, children)

Refer to the [snabbdom](https://github.com/snabbdom/snabbdom) documentation for this function. 

The following plugins are available in Uzu for element options:

* `class`
* `style`
* `attrs` (attributes)
* `dataset`
* `on` (eventlisteners)
* `props` (properties)

Import it with:

```js
const {h} = require('uzu')
```

### component(options)

Create stateful, event-driven components that wrap DOM elements.

Import it with:

```js
const {component} = require('uzu')
```

Valid options include:

* `state` - (optional) - initial state data. This **must** be an object.
* `on` - (optional) - event names and handler functions
* `view` - (required) - a function that returns a snabbdom tree of DOM elements

_Quick example_

```js
const myComponent = component({
  state: {count: 0},
  on: {
    ADD: (val, state, emit) => emit('UPDATE', {count: state.count + val})
  },
  view: function (state, emit) {
    return h('div', [
      h('p', ['Total count: ', String(state.count)]),
      h('button', {on: {click: () => emit('ADD', 1)}}, '+1'),
      h('button', {on: {click: () => emit('ADD', -1)}, '-1')
    ])
  }
)}

myComponent.emit('ADD', 1)
myComponent.emit('ADD', -1)
myComponent.emit('ADD', 10)
myComponent.state // {count: 10}
```

All components have an **UPDATE** event built-in. It takes an object that gets merged into the state. It also re-renders the component's view and updates the DOM.

```js
// Merge new data into the state and re-render the view:
myComponent.emit('UPDATE', {count: -99})
```

The **return value** of `component()` is an object with these keys:

* `emit` - a function that fires an event, taking an event name and some data
* `on` - a function that lets you add event listeners, taking an event name and callback.
* `state` - the component's state data
* `node` - the plain DOM node for this component
* `vnode` - the snabbdom virtual node for this component

To parameterize a component's options (a "component constructor"), simply wrap it in a function:

```js
function Counter (initial=0) {
  return component({
    state: {count: initial},
    ... // etc
  })
}
```

#### Embedding child components

You can easily nest components inside of other components

Initialize the child component, save it into the parent's state, and insert the child's vnode in the parent's view.

You can also initialize child components dynamically from a parent from within an event.

## Development

After cloning the repo, run `npm install`.

Run `npm test` to run the tests. Tests run in a headless browser using `tape-run`.

PRs are welcome.
