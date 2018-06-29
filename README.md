# :cyclone: uzu :cyclone:

Uzu is a small, simple, and efficient library for creating UI components with a slightly different approach.

The premise of uzu is that UI programming becomes messy and difficult because of **state and event intercommunication across the whole layout of the page**. In many UI frameworks, it's easy to make a spaghetti mess of components, parameters, and states.

In uzu, you have one global **state tree** that can be accessed using **scopes**. Scopes are simple
arrays of strings.

To initialize data and event handlers in the global state tree, you can make a **component**:

```js
const {component} = require('uzu')

const counter = component({
  scope: ['counter'],
  state: {count: 0},
  on: {
    add: (n, {count}) => ({count: count + n})
  }
})

counter // -> {count: 0}
```

To access state for a component, you use its scope:

```js
const {get} = require('uzu')

get(['counter']) // -> {count: 0}
```

To fire an event for a component, you also use its scope:

```js
const {get, emit} = require('uzu')

emit(['counter'], 'add', 2)
get(['counter']) // -> {count: 2}
```

If you don't want to hard-code your component's scope naming, you can parameterize it:

```js
function Counter (start, name) {
  return component({
    scope: ['counter', name],
    state: {count: start},
    on: {..}
  })
}

const counter1 = Counter(1, 'a')
const counter2 = Counter(2, 'b')

get(['counter', 'a']) // -> {count: 1}
get(['counter', 'b']) // -> {count: 2}
```

You can return an array of all component states under a certain scope by using '*':

```js
get(['counter', '*']) // -> [{count: 1}, {count: 2}]
```

Likewise, you can emit an event for all components under a scope by using '*':

```js
emit(['counter', '*'], 'add', 2)
get(['counter', '*']) // -> [{count: 3}, {count: 4}]
```

To render your dynamic global state to the DOM, you can use Uzu's bindings to Snabbdom:

```js
const {h, render} = require('uzu')

function view () {
  const counters = get(['counter', '*'])
  return h('div', [
    h('h2', 'Counters'),
    h('div', counters.map(counterView)),
    h('button', {on: {click: createCounter}}, 'Add counter')
  ])
}

function counterView (counter) {
  return h('div', [
    h('p', 'Count: ', counter.count),
    h('button', {
      on: {click: () => emit(['counter', counter.id], 'add', 1)}
    }, 'Increment'),
    h('button', {
      on: {click: () => emit(['counter', counter.id], 'add', -1)}
    }, 'Decrement')
  ])
}

const container = document.querySelector('.container')
render(container, view)
```

Your dom will get updated automatically whenever data in the global state tree is updated.

_Quick examples_

* 7guis
  * [CRUD](examples/7guis/crud.js)
* [Multiple counters](examples/counter-many.js)
* [Countdown timer](examples/7guis/timer.js)

## Getting Started

The `h` function creates DOM elements while the `component` function wraps those elements with stateful, event-driven behavior.

The `h` function comes directly from [snabbdom](https://github.com/snabbdom/snabbdom). Reference the documentation there for its API. This library pre-initializes snabbdom with several plugins activated: `props`, `attributes`, `style`, `dataset`, `class`, and `eventlisteners`.

```js
const {h} = require('uzu')

const todoItem = h('div', {
  class: {finished: true}
}, [ 'Wash the dishes' ])
```

The `component` function allows you to wrap your DOM elements in dynamic, stateful behavior.

```js
const {component, h} = require('uzu')

function TodoItem (name) {
  return component({
    state: {name, finished: false},
    on: {
      TOGGLE: function (_, state, emit) {
        // Toggle this item's finished state
        state.finished = !state.finished
        emit('UPDATE', state)
      },
    },
    view: function (state, emit) {
      return h('div', {
        class: {finished: state.finished}
      }, [ 
        h('input', {
          on: {change: () => emit('TOGGLE')}
        }),
        state.name
      ])
    }
  })
}

myTodos = [TodoItem('wash dishes'), TodoItem('party')]
myTodos[0] // -> {state, on, emit, vnode, node}
```

You can render the page by using `component.node`

```js
const todoItem = TodoItem('wash dishes')
document.body.appendChild(todoItem.node)
```

Most often, you will have a large tree of nested components, and you will only append the top-level component's node to the page.

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

**NOTE**: Don't forget to set the `key` property in repeated snabbdom elements ([more information](https://github.com/snabbdom/snabbdom#key--string--number))

### component(options)

Create stateful, event-driven components that wrap DOM elements.

Import it with:

```js
const {component} = require('uzu')
```

`component` is a simple function with these options:

* `state` - (optional) - initial state data -- can be anything
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

#### Updating state and updating the DOM

All components have an **UPDATE** event built-in. It optionally takes a new state to replace the previous state. It also re-renders the component's view and updates the DOM.

```js
// Set the state to something new and re-render the DOM
myComponent.emit('UPDATE', {count: -99})
```

#### Component object

The **return value** of `component()` is an object with these keys:

* `emit` - a function that fires an event, taking an event name and any data
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

#### Event handler functions

The event handlers (the `.on` option for a component), has the function signature `(data, state, emit)`

* `data` is the second argument passed to `emit` -- `component.emit('EVENT_NAME', data)`
* `state` is the component's current state object
* `emit` is a function allowing you to trigger other events for the component (eg. "UPDATE")

```js
const simpleCounter = component({
  state: {count: 0},
  on: {
    INCR: function (amount, state, emit) {
      emit('UPDATE', {count: state.count + amount})
    }
  },
  view: ...
})
```

You can also create event handlers for a component by using `component.on` after the component is initialized. The `on` option is provided simply for convenience to make it easier to create components in-line.

#### View function

The view function takes `(state, emit)` as parameters and must return a snabbdom vnode

The view function is called every time the **UPDATE** event is fired for the component. When the view function is called, the `component.node` is automatically updated.

```js
const simpleCounter = component({
  state: {count: 0},
  on: ...
  view: function (state, emit) {
    // This function is called every time the 'UPDATE' event fires for this component
    // state is the current component's state
    // emit is a function allowing you to emit events for this component
    return h('div', ...)
  }
})
```

#### Inserting a component onto the page

In order to actually view your component in the browser, you need to append it or insert it somewhere in the document. Every component has a `.node`, which is a plain DOM node. Append the node for your top level component:

```js
document.body.appendChild(component.node)
```

#### Embedding child components

You can easily nest components inside of other components by storing any child components in the parent component's state. To render a child component's view in a parent's view, simply use `childComponent.vnode`:

```js
function TodoList (items=[]) {
  const todoList = component({
    state: {items},
    on: {
      APPEND: function (name, state, emit) {
        // Save new todo item components in our state
        state.items.push(TodoItem(name))
        emit('UPDATE', state)
      },
      REMOVE: ...
    },
    view: function (state, emit) {
      // We can render all the child components by .vnode
      return h('div', state.items.map(item => item.vnode))
    }
  })
  return todoList
}
```

#### NOTE: child and parent rendering

If you have embedded some child components inside a parent component, and you fire "UPDATE" on the parent component, then **only** the parent component will re-render -- not the children.

If you want your child components to re-render on an "UPDATE" to the parent component, you need to handle this explicitly:

```js
parentComponent.on('UPDATE', () => {
  parentComponent.state.childComponent.emit('UPDATE')
})
```

Most often, if you want a child component to be affected by a parent component, then you will want to handle specific actions on both the parent and child that have specific meaning:

```js
userDashboard.on('SAVE_ALL_USERS', () => {
  for (let id in parentComponent.state.users) {
    const user = parentComponent.state.users[id]
    user.emit('SAVE_TO_SERVER')
  }
})
```

### Debugging

If some of your components are misbehaving and you're trying to figure out why, try out the `debug` function:

```
const {debug} = require('uzu')

debug(myComponent, 'myComponent')
```

This will log every event and state change. The first parameter is an initialized component. The second parameter is an optional name of the component for logging.

## Tips n Tricks

### Communicating among components

A goal of Uzu is to make it very easy to dynamically communicate among components, whether it is sibling-to-sibling, parent-to-children, children-to-parent, or otherwise.

#### Sibling to sibling

Say we wanted to reuse the `TodoItem`, component, but also wanted another `ToggleButton` component to trigger its finished state. We can do:

```js
const toggleButton = ToggleButton({initialVal: false})
const todoItem = TodoItem({name: 'wash dishes', finished: false})
toggleButton.on('TOGGLE', () => {
  todoItem.emit('TOGGLE')
})
```

#### Parent to children

If you want a parent component to send events to its children, the easiest way is to add an event handler after you've initialized the parent component:

```js
function TodoList (items=[]) {
  const todoList = component({
    state: {items},
    on: {
      APPEND: function (name, state, emit) {
        const newItem = TodoItem(name)
        const items = state.items.concat([newItem])
        emit('UPDATE', {items})
      },
      REMOVE: function (name, state, emit) {
        // Remove items by exact match on name
        emit('UPDATE', {
          items: state.items.filter(i => i.name !== name)
        })
      }
    },
    view: ...
  })

  // Add a handler for toggling all child todo items with one action
  todoList.on('TOGGLE_ALL', () => {
    todoList.state.items.forEach(item => item.emit('TOGGLE'))
  })

  return todoList
}
```

#### Globally

It's often helpful to keep a global state for your application that all components can reference, similar to a database on the backend.

You can still keep your components isolated and decoupled from any global state by only interfacing with the global state outside of the component's constructor.

In the below example, the "Dropdown" component is imported and not initially coupled to any global state. When you initialize it, we add some code to keep its contents in sync with the global state from outside the component itself:

```js
// Initialize the dropdown with the initial global users array
const dropdown = Dropdown(globalState.get('users'))
// Whenever the global users array is updated, we want to sync the change with the dropdown
globalState.on('update:users', users => {
  dropdown.emit('UPDATE_OPTIONS', users)
})
// NOTE: globalState is not part of the uzu API, but could be easy to make

// Elsewhere on the page, you may want other components listening to user updates
globalState.on('update:users', users => {
  userCounter.emit('UPDATE_COUNT', users.length)
})
```

In the above example, `globalState` serves as a kind of central bus that can be used to update disconnected components, even if those components do not have access to each other. You can still keep the source modules for these components (`UserCounter` and `Dropdown`) pure and decoupled from global state, with isolated unit tests.

### Testing components

It's simple to test components. Initialize them, fire some events, and test for state and DOM changes.

```js
const test = require('tape')
const Comp = require('myComponent')

test('example', t => {
  const comp = Comp(args) 
  test.deepEqual(comp.state, {...})
  comp.emit('MY_EVENT', someData)
  test.strictEqual(comp.state.x, 'x')
  test.strictEqual(comp.node.querySelector('input').value, 'xyz')
  t.end()
})
```

### Rendering repeated elements

If you render a dynamic list of elements, don't forget to pass in the `key` property for the snabbdom `h` function:

```js
// We are going to be rendering many of these in a row in the parent
// we want to set a `key` on every one
function TodoItem (name, id) {
  const div = h('div', {
    key: id
  }, [name])
}
```

[More information](https://github.com/snabbdom/snabbdom#key--string--number)

## Development

After cloning the repo, run `npm install`.

Run `npm test` to run the tests. Tests run in a headless browser using `tape-run`.

To run the examples, do:

```sh
$ npm install -g budo
$ budo --live --open examples/counter-many.js
```

PRs are welcome.
