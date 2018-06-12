# :cyclone: uzu :cyclone:

Uzu is a minimalistic, expressive, and modular UI library that is designed to work closely with the plain DOM API.

The philosophy of Uzu is that you can make composable, testable, concise components without needing complex systems like virtual DOM, MVC, or tricky state systems. Instead, you only need a simple way of [creating plain DOM elements](/dom) and [handling dynamic data](/channel).

_Modules_
* **[/channel](/channel)** -- handle dynamic data
* **[/dom](/dom)** -- create and manage DOM nodes

Getting started tutorial - creating a list

**Examples!** We have a large set of implemented examples, so you can get a quick intuition for what the code looks like:

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

# Tips n tricks

#### Decoupling business logic from presentation

It makes sense for simple components to include all their code in a single file. If you later find that you want to reuse or abstract some of that code, then you can simply move that code into its own module and import it into your component:

_Before_ - the createUser business logic is inside the `user-form.js` module

```js
// user-form.js

const {h} = require('uzu/dom')

function createUser (submitEv) {
  // Business logic to take a form submit event, format user data, post to the server, and handle responses
  // ...
}

function view () {
   // ...
   const form = h({
     on: { submit: createUser }
   }, [ /* .. user fields .. */ ])
}
```

_After_ - the createUser function has been extracted into its own module

```js
// create-user.js

function createUser (formData) {
  // Business logic to format user data and post to the server
  // ...
}

module.exports = createUser
```

```js
// user-form.js

const serialize = require('form-serialize')
const {h} = require('uzu/dom')
const createUser = require('lib/create-user')

function view () {
   // ...
   const form = h({
     on: { submit: createUser }
   }, [ /* .. user fields .. */ ])
}
```

#### View flexibility

Unlike many UI systems, views in Uzu are generic functions -- they can take any parameters and return any values. Most often they take state data as parameters and return DOM nodes. But they can also take DOM nodes in the parameters and return state values along with DOM nodes.

Here is a todo item that takes arbitrary child nodes and returns its status as well as its dom node:

```js

function view (name, children) {
  const completed = channel(false)
  const div = h('div', [
    h('input', {
      on: {
        change: ev => {
          completed.send(ev.currentTarget.checked)
        }
      }
    }),
    h('label', {
      class: { completed: completed }
    }, name),
    h('span', children)
  ])
  return {node: div, completed: completed}
}

```

#### Testing

Unit testing components is easy. Use something like [`tape-run`](https://github.com/juliangruber/tape-run) so you can run run the DOM. Then simply import your components, mess with them, and check the results:

```js
const timer = require('components/timer')
const test = require('tape')

test('can set duration', t => {
  const testTimer = timer({duration: 10}))
  t.end()
})
```

#### Tracing and debugging UI components from the browser

In more complex systems, it's often hard to stack trace the behavior of some given DOM element when you're debugging parts of a page. In Uzu, the view functions are the "origin of all behavior". In other words, if you are trying to figure out why a certain button behaves in a certain way, you can find out by going to the button's view function, and then tracing its behavior from there.

Add comment wrappers around every view function with the filepath for your components to make it easier to backtrace the component from the DOM:

```js
// lib/common/notifier.js

function view (state) {

  return h('div', [
    h('!', 'start lib/common/notifier'),
    // ... more UI stuff
    h('!', 'end lib/common/notifier')
  ])
}
```

When you're debugging a component from the browser, simply inspect the element and find the nearest comment to find the component file.

#### Lib compatibility -- no weird framework lock-in

You can freely use a lot of plain javascript libraries without special modifications, such as pell, pikaday, D3, chart.js, etc, etc. As long as the library works with plain DOM nodes, svg, or canvas, it is fully compatible.

On the flipside, any module you create in uzu will look like a plain-JS, plain-DOM library, and your users won't need to learn Uzu to use your library.
