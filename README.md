# :cyclone: UZU

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

### Stateless components

Create a static dom element:

```js
h('div', {
  style: { color: 'pink' },
  on: { click: ev => console.log('hello world!', ev) }
}, 'Hello world')
```

Refer to the [snabbdom documentation](https://github.com/snabbdom/snabbdom) for usage of the `h()` function

> These built-in snabbdom plugins are included: props, class, eventlisteners, dataset, attributes, and style

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

* `component._render()` -- re-render and patch the DOM for the component. This is called explicitly.
* `component._store` -- Stored data for the component, most likely an object. This can be mutated before a re-render.

### Statecharts

Statecharts are a declarative way to define the behavior for your UI. For general information, [see here](https://statecharts.github.io/). Uzu comes with a small statechart implementation that you can use within the `_store` of your components.

#### statechart(initial, events)

Import with:

```js
const statechart = require('uzu/statechart')
```

Create a new statechart with initial state `initial` and event transitions in `events` (described below).

* `initial` is a string of the state name to start in
* `events` is an object where:
    * each key is a state transition name (such as "click", "reset", "finish", etc)
    * each value is an array of objects with these properties:
        * `sources` is an array of state names (strings) that this event can transition *out of*
        * `dest` is the destination state (string) that this event transitions *into*
        * `action` is a function that gets called when this event transition happens

This returns an instance of the statechart.

To get the current state, access `chart.current` on the instance.

The statechart instance will have methods for every event you defined. You can pass data into the arguments, which gets passed into the `action` function handler. For example, you might call `chart.formSubmit(data)` to submit a form with associated data, transitioning the statechart into the "loading" state.

#### Statechart example

Say we wanted to modify our counter to be based around a statechart. When the counter is at zero, our state is "reset". Above zero and below a maximum, our counter is in the state "counting". When we reach the maximum value, our state is "finished".

* When we are in the "reset" state, it is not possible to fire the "reset" action (an error will get thrown). We can only fire the "count" action from this state, which transitions us into the "counting" state.
* When we are in the "counting" state, we can fire the "count" event or the "reset" event.
* When we are in the "finished" state, we can no longer fire the "count" event (an error will be thrown). We can only fire the "reset" event.

Here is the statechart, where each action takes an instance of the counter component and modifies its store:

```js
const chart = statechart('reset', {
  count: [{
    sources: ['reset', 'counting'],
    dest: 'counting',
    action: (counter) => {
      // Increment the counter's store.count
      counter._store.count += 1
      counter._render()
      // Check if we are at the max and fire the "finish" event
      if (counter._store.count === max) {
        chart.finish(counter)
      }
    }
  }],
  reset: [{
    sources: ['counting', 'finished'],
    dest: 'reset',
    action: (counter) => {
      // Reset the store's count to zero
      counter._store.count = 0
      counter._render()
    }
  }],
  finish: [{
    sources: ['counting'],
    dest: 'finished',
    action: (counter) => {
      // No updates to the store, but re-render the component
      counter._render()
    }
  }]
})
```

* `chart.current` will be initially set to "reset".
* If we run `chart.count(timer)`, then `chart.current` will be "counting"
* If we are in the "finished" state and we try to run `chart.count(timer)`, an error gets thrown

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
