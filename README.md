
# ui system prototype

This is an ultra minimalistic UI system inspired by state automatas and streams. This repo is a quick n dirty prototype for demo/discussion purposes. States are simple observable data containers that use node's EventEmitter. They can be used to generate dynamic HTML (and svg and canvas) in a simpler (and possibly faster) way than virtual DOM.

Examples:
* [todo MVC](/examples/todo.js) (no styling)
* 7guis ([info](https://github.com/eugenkiss/7guis/wiki))
   * [counter](/examples/7guis/counter.js)
   * [temperature converter](/examples/7guis/temperature-converter.js)
   * [flight booker](/examples/7guis/flight-booker.js)
   * [timer](/examples/7guis/timer.js)
   * [crud](/examples/7guis/crud.js)
   * [circle-drawer](/examples/7guis/circles.js)
   * [cells](/examples/7guis/cells.js)
* [multiple dynamic counters](/examples/counter-many.js)
* [wikipedia search](/examples/wiki-search.js)

## state(defaults)

This is exported in `./index.js`.

```js
const state = require('./index')
function BeanCount (initial) {
  return state({ count: initial })
}
```

A state is simply an object containing data, and will get an event emitter attached to it. See `on` for handling update events.

State properties are strict, kind of like structs in other languages. If you try to update a property in the state that wasnt initialized when the state is first created, then a TypeError will get thrown. This is a bug prevention / code readability measure.

```js
const counter = state({count: 1})
counter.update({id: 0}) // throws TypeError
const counterWithID = state({count: 1, id: 0})
counterWithID.update({id: 99}) // ok
```

## state.update(data)

In order to update a state, use the `update` method.

`state` is an instance of some state object.

`data` is an object that will get merged into the state. For every key/value, an event will get emitted (see `on` below).

```js
const bc = BeanCount(0)
const data = {count: 1, hidden: false}

bc.update(data)
bc.update({count: 2})
bc.update({count: 3, hidden: true})
// etc
```

## state.on(prop, fn)

Call the function `fn` each time the property `prop` gets updated in the state. This will also call `fn` immediately for the current value of the prop.

```js
bc.on('count', (c) => console.log('count updated to', c))
```

# dom

You can create views by generating plain HTML elements. One way to make this easier is to use something like [bel](https://github.com/shama/bel).

For most needs, like element attributes, properties, style, classes, text content, you can simply use the `on` function to make changes to the html elements.

The `dom` module also provides a `childSync` function that allows you to create dynamic child elements from a state that has an array of objects.

Unlike with virtual dom libraries, the view functions only get called once on pageload. Instead of diffing and patching entire trees, we listen to changes on state properties and make changes to dom elements directly using the browser's built-in HTMLElement and DOM Node API

```
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
  beanCount.on('count', c => { span.textContent = c })

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

```
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

# Undo and redo

[See here for an undo-redo helper module](/undo-redo)

# Debug logging

Set the following in your browser console to enable some debugging messages:
* `localStorage.debug = "uzu:*"` to show all debugging messages
* `localStorage.debug = "uzu:state"` to show state-related messages
* `localStorage.debug = "uzu:dom"` to show dom-related messages

# Patterns & philosophy

## Modularity

Uzu is designed with different layers of modularity in mind.

### Data & domain logic

Data constructors and functions over data can live in their own files and their own modules and can be reused for different views. The principles are:
* State and domain logic can be decoupled from views -- the same set of state functions can be represented by a bunch of different views
* The same type of state object could be constructed in many different ways by many functions --- we are not bound to a single constructor function
* The same logic function can take different types of state objects, as long as the states have common attributes.

### Views

A typical view takes state objects as parameters and returns an HTMLElement. Views can also initialize new state objects, pass them down to other views, or even return any extra data along with the DOM nodes. This way, state can easily bubble up and down through your tree of view functions.

View functions can use any library they want to generate plain [HTMLElements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement). `bel` is a good option, but any other library that generates DOM nodes would also work just fine!

### Using other libs

You can freely use a lot of non-uzu libraries without special modifications, such as pell, pikaday, chart.js, etc, etc. As long as the library uses plain html, svg, or canvas, it is fully compatible -- no weird framework lock-in.

#### Mixin views

Often, the user of a view function wants to tweak a bunch of nested markup when they use a component. Instead of having your view construct any markup, it can be easier to have the user create all the markup themselves, while the view function takes the markup as a parameter and uses `data-*` attributes to add in functionality.

As long as the source markup has the right `data-*` attributes, the user can change up their markup however they want.

```js
// Here, "elem" is a user-supplied element that we are adding counter functionality into
function counterView (elem, startCount) {
  const counter = state({count: 1})
  const incrBtn = elem.querySelector('[data-bind="increment"]')
  const countTxt = elem.querySelector('[data-bind="count"]')
  incrBtn.addEventListener('click', () => counter.update({count: counter.count + 1}))
  counter.on('count', { c => countTxt.textContent = c })
  return elem
}
```

This way, the user can use any of the following "templates" to pass into the `counterView` function:

```html
<div class='counter1'>
  <button data-bind='increment'> Increment !!! </button>
  <p data-bind='count'></p>
</div>

<div class='counter1'>
  <div class='col-6'>
    <div class='xlarge' data-bind='count'></div>
  </div>
  <div class='col-6'>
    <a data-bind='increment'> add 1 </a>
  </div>
</div>

<div class='counter3>
  <button data-bind='increment' data-bind='count'>0</button>
</div>
```

### Presentation logic

Sometimes, you want to initialize and control some states, but you are fairly positive the logic doesn't need to be in a module, and doesn't need to be reused anywhere else. These states and code can simply get initialized and live inside your view function. Some examples include:
* Dropdown open/close state
* Tab swapping state
* Activating a sidebar
* Showing/hiding an input

In these cases, it may be simplest to keep these states hidden inside the view functions where they are needed. As soon as you realize you want to reuse the code elsewhere in your app, you can start to move the logic into their own modules.

