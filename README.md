# UZU

Uzu is a minimalistic way to write modular components with [snabbdom](https://github.com/snabbdom/snabbdom) in just [30 lines of code](index.js)

* Composable, nestable, testable components 
* Scalability with local component state and efficient sub-tree patching of the dom

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
* The view function should return a snabbdom virtual-dom tree
* Call `component._render()` to update it in the DOM
* Save child components inside the parent components' state
* Render child components with `child.view(args)`
