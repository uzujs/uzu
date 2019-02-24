# UZU

Uzu is a minimalistic way to write modular components with [snabbdom](https://github.com/snabbdom/snabbdom) in just [30 lines of code](index.js)

* Composable, nestable, testable components 
* Scalability with local component state and efficient sub-tree patching of the dom (automatic thunking)

[See the examples directory](./examples)

## Installation

Install via npm with `npm i uzu`

```js
const { Component, h } = require('uzu')
```

## Usage

Use the `Component` constructor, which takes an object of state data, updater methods, and a view function.

```js
// Create a component
function Counter (start = 0) {
  return Component({
    count: start,
    incr (n) {
      this.count += n
      this._render()
    },
    view () {
      return h('div', [
        h('p', ['Count is ', this.count]),
        h('button', {
          on: { click: () => this.incr(1) }
        }, 'Increment'),
        h('button', {
          on: { click: () => this.incr(-1) }
        }, 'Decrement'),
      ])
    }
  })
}

// Render it to the page
document.body.appendChild(Counter(10).view().elm)
```

* Refer to the [snabbdom documentation](https://github.com/snabbdom/snabbdom) for usage of the `h()` function
  * These snabbdom plugins are included: props, class, eventlisteners, dataset, attributes, and [snabbdom-ministyle](https://github.com/uzujs/snabbdom-ministyle)
* The view function should return a snabbdom virtual-dom tree
* Call `component._render()` to update it in the DOM
* Save child components inside the parent components' state
* Render child components with `child.view(args)`

#### Nested and modular components

Components can be exported, imported, nested, composed, and aggregated. This is enabled by placing the child component inside the state of the parent component:

```js
// A list of multiple counters, reusing the above counter component
function CounterList () {
  return Component({
    counters: [],
    totalCount () {
      return this.counters.reduce(c => c.count, 0)
    },
    addCounter () {
      this.counters.push(Counter())
      this._render()
    },
    removeCounter (counter) {
      this.counters = this.counters.filter(c => c !== counter)
      this._render()
    },
    view () {
      return h('div', [
        h('p', ['Total count of all counters is ', this.totalCount()]),
        h('button', {
          on: { click: () => this.addCounter() }
        }, 'Add counter'),
        h('div', this.counters.map(counter => {
          // For each counter, render a remove button, plus the counter's own view
          return h('div', [
            h('button', {
              on: { click: () => this.removeCounter(counter) }
            }, 'Remove counter'),
            counter.view()
          ])
        }))
      ])
    }
  })
}
```

In the above example, each counter's entire component object is inserted into an array in the parent component.

To view each child counter, you simply call `counterObject.view()` from within the parent view.

#### Styling

You can modularly style elements using [snabbdom-minstyle](https://github.com/uzujs/snabbdom-ministyle).
