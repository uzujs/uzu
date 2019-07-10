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
const { Component, h } = require('uzu')
```

* Refer to the [snabbdom documentation](https://github.com/snabbdom/snabbdom) for usage of the `h()` function
  * These snabbdom plugins are included: props, class, eventlisteners, dataset, attributes, and style

### Component({view, data, actions, transitions}) -- initialize a component

The component constructor can take a number of options:

* `view` - a view function that returns a snabbdom virtual-node tree
* `data` - arbitrary javascript data for your component
* `actions` - an object of functions for updating component data and re-rendering the view
* `transitions` - state machine transitions (see below)

### State machines

Uzu supports simple statechart functionality to organize your UI logic with the `transitions` option.

To set the initial state machine state, set `transitions.initial` to a string state name. This is required.

Additional `transitions` entries should be objects where: 

* Each key is a transition event name
* Each value is an array of objects
  * Each object should have the following keys:
  * `sources` - array of state names that we are allowed to transition out of
    for this event
  * `dest` - a single state name that we transition into
  * `when` - optional - predicate function. This transition event only occurs
    when this function returns truthy. Its arguments are an instance of the
    component, plus any additional data passed in the transition function
    (`component.transitionEvent(args)`.
  * `action` - optional - action function to perform as a side effect of this
    state transition. Its arguments are an instance of the component, plus any
    additional data passed in the transition function
    (`component.transitionEventName(args)`)


### Events

You can listen to an event emitter for component updates: `component._emitter.on('event', args)`

Events emitted are:

* `action:name` - an action function was called and completed. Callback args will be the args to the action function
* `transition:name` - a state transition completed. Args will be any args to the transition function
* `state:name` - The given state has been entered. Arg will be the previous state.

## Tips and tricks

* Initialize and save child components inside the parent component's data object
* Render child components with `child.view(args)`
* Don't pass arguments to a child component view unless you need to. Having no args will reduce re-renders.
* To manually re-render a component, call `component._render()`
