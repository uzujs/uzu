# dom

You can create views by making plain HTML elements. One way to make this easier is to use something like [bel](https://github.com/shama/bel).

For most needs, like element attributes, properties, style, classes, text content, you can simply use the `on` function to make changes to the html elements.

The `dom` module also provides a `childSync` function that allows you to create dynamic child elements from a state that has an array of objects.

Unlike with virtual dom libraries, the view functions only get called once on pageload. Instead of diffing and patching entire trees, we listen to changes on state properties and make changes to dom elements directly using the browser's built-in HTMLElement and DOM Node API

```js
const html = require('bel')
const state = require('../index')

function BeanCount (initial) {
  return state({count: initial})
}

function increment (c) {
  c.update({count: c.count + 1})
}

function view (beanCount) {
  const countSpan = document.createElement('span')
  beanCount.onUpdate('count', c => { span.textContent = c })

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
* `state`: state object
* `prop`: string property name in the state
* `view`: view function that takes `state[prop]` and returns an HTMLElement
* `container`: string tagname or HTMLElement that wraps all the child elements

`state[prop]` should be an array of objects, and each one of those objects must have an `id` property.

`container` should be a tagname or an empty html/svg node that you want to append all the children into.

This function allows you to very efficiently append, remove, and reorder dynamic elements on the page. All transient state, like checkboxes and input values, get preserved, even on reordering. This is all based on the `id` property in each object in your array.

`childSync` will also keep track of exactly what event listeners you create for every child view, for any state at all. If the child node gets removed, all event listeners that were created inside the view (with calls to `state.on`) will also get removed.

## dom.route(options)

Swap out different views based on a state property. When a view is not visible, all its event listeners are removed and its dom tree is not in memory.

The `options` argument should be an object with these properties:
* `state`: state object
* `prop`: string property name in the state
* `routes`: object where each key is a possible value of `state[prop]`, and each value is a view function that returns an HTMLElement
* `container`: string tagname or HTMLElement that wraps all the child elements

`state[prop]` should be a string reprenting a current page/tab/etc.

`container` can be any dom element that you want to use to contain your different views

`routes` should be an object where each key is a string (eg. page name, tab name, etc) and each value is a function that returns a DOM node.

```js
const tabState = state({page: 'a'})
const tabs = dom.route({
  state: tabState,
  prop: 'page',
  container: 'div',
  routes: {
    a: viewA,
    b: viewB,
    c: viewC
  }
})
// `tabs` is a div element that will have either viewA, viewB, or viewB as its child node depending on tabState.page
```
