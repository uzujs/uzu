# UZU

Uzu is a simple way to write modular components with [snabbdom](https://github.com/snabbdom/snabbdom)

* Composable, nestable, testable components 
* Simple state machine / statechart features
* Scalability with local component state and efficient sub-tree patching of the dom (automatic thunking)

[See the examples directory](./examples)

## Installation

Install via npm with `npm i uzu`

## API

Import with:

```js
const { stateful, h } = require('uzu')
```

* Refer to the [snabbdom documentation](https://github.com/snabbdom/snabbdom) for usage of the `h()` function
  * These snabbdom plugins are included: props, class, eventlisteners, dataset, attributes, and style

### Stateless components

Create a static dom element:

```js
h('div', {
  style: { color: 'pink' },
  on: { click: ev => console.log('hello world!', ev) }
}, 'Hello world')
```

### Stateful components

#### stateful(store, view)

The **store** is any javascript data you want to keep track of in the UI for your component.

The **view** is a function that takes an instance of the component and returns a snabbdom vnode tree (using the `h()` function).


```js
const { h, stateful } = require('uzu')

function Counter (start = 0) {
  const store = { count: start }
  return stateful(store, (counter) => {
    return h('div', [
      h('button', {
        on: { click: () => incrCounter(counter) }
      }, 'Count is ' + counter._store.count)
    ])
  })
}

// Increment the count for a Counter instance
function incrCounter (counter) {
  counter._store.count += 1
  counter._render()
}
```

### Component methods and properties

* `component._render()` -- re-render and patch the DOM for the component. This is called explicitly
* `component._store` -- Stored data for the component, most likely an object. This can be mutated before a re-render.

### Component trees

Child components can be deeply nested in a hierarchy of parent components. Initialize the child components and save them in the parent component's store.

Say we wanted a parent component with three counters, with a button to increment all:

```js
function ThreeCounters () {
  const c1 = Counter(1)
  const c2 = Counter(2)
  const c3 = Counter(3)
  const store = {
    c1, c2, c3
  }
  return stateful(store, (cmp) => {
    return h('div', [
      h('button', {
        on: { click: () => incrAll(cmp) }
      }, 'Increment all'),
      c1,
      c2,
      c3
    ])
  })
}

// Takes an instance of ThreeCounters
// Increments all child counters
function incrAll (cmp) {
  incrCounter(cmp._store.c1)
  incrCounter(cmp._store.c2)
  incrCounter(cmp._store.c3)
}
```

## Tips and tricks

* Initialize and save child components inside the parent component's data object
