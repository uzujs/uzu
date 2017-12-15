# uzu/dom

Views in uzu are functions that take some data and return plain DOM elements. You can use something like [bel](https://github.com/shama/bel) to make it easier to create DOM nodes.

This module helps you keep certain dynamic data in sync. The module handles two special cases:

1. **childSync**: You have an array of data that updates dynamically on the page.
  * Each element in the array should be respresented by a DOM element, such as table rows, list elements, etc
  * When you add, remove, or re-order elements in the array, then the DOM elements should also re-order very efficiently, without losing any of their state.
  * When an element is removed, any event listeners should also get removed from memory
2. **route**: You have separate pages or tabs that should swap out large parts of the page
  * Show a separate DOM tree based on a current page name
  * When a page disappears, any event listeners should get removed from memory

For all other cases, we can simply use a channel's `listen` method combined with the plain-JS DOM API to create dynamic content.

See some [examples](/examples) to see how `dom.childSync` and `dom.router` gets used.

```js
const html = require('bel')
const channel = require('uzu/channel')

function BeanCount (initial) {
  return {count: channel(initial)}
}

function increment (c) {
  bc.count.send(bc.count.value + 1)
}

function view (beanCount) {
  const countSpan = document.createElement('span')
  beanCount.count.listen(c => { span.textContent = c })

  return html`
    <div>
      <p> Bean counter </p>
      <button onclick=${ev => increment(beanCount)}> Add a bean </button>
      Total beans: ${countSpan}
    </div>
  `
}
```

## dom.childSync(options)

Create a dynamic set of child elements. The `options` argument should be an object with these properties:

* `channel`: channel that has arrays of objects, where each object has an `id`
* `view`: view function that takes values from the channel and returns an HTMLElement
* `container`: string tagname or HTMLElement that wraps all the child elements (optional -- defaults to a new span)

`channel` should be an array of objects, and each one of those objects must have an `id` property.

`container` should be a tagname or an empty html/svg node that you want to append all the children into. If you don't provide this, then the child elements will get wrapped in a span.

This function allows you to very efficiently append, remove, and reorder dynamic elements on the page. All transient state, like checkboxes and input values, get preserved, even on reordering. 

All the reordering is based on the `id` property in each object in your array stored in `channel`. You'll want every element in that array to have a unique and persistent ID.

`childSync` will also keep track of exactly what event listeners you create for every child view, for any channel whatsoever. If the child node gets removed, all event listeners that were created inside the view (with calls to `channel.listen`) will also get removed.

## dom.route(options)

Swap out different DOM trees based on a page channel. When a view is not visible, all its event listeners are removed and its dom tree is not in memory.

The `options` argument should be an object with these properties:
* `channel`: channel of page names
* `routes`: object where each key is a page name, and each value is a view function that returns an HTMLElement
* `container`: string tagname or HTMLElement that wraps all the child elements (optional -- will default to a span)

`channel` should hold a string representing a current page/tab/etc.

`container` can be any dom element that you want to use as a container (defaults to a span)

`routes` should be an object where each key is a string (eg. page name, tab name, etc) and each value is a function that returns a DOM node.

```js
const page = channel('a')
const tabs = dom.route({
  channel: page,
  routes: {
    a: viewA,
    b: viewB,
    c: viewC
  }
})
// the `tabs` variable is a DOM element 
// it will have either viewA, viewB, or viewC as its child node depending on the current value of tabState.page

tabs // shows the result of viewA
page.send('b')
tabs // shows the result of viewB
page.send('c')
tabs // shows the result of viewC
```
