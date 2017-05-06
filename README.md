# :cyclone: uzu :cyclone:

> **PLEASE NOTE** This project is very much still in progress and experimental, and is not ready for widespread use

Uzu is a library for creating UI components on the web using virtual DOM (powered by [Snabbdom](https://github.com/snabbdom/snabbdom)) combined with functional reactive programming.

_Benefits_
* Keep large and complex single-page applications nicely organized
* Nest and compose your UI modules
* Keep your apps snappy and responsive with event streams and virtual DOM
* Easily create unit tests for your UI logic
* Bootstrap a new application quickly with `uzu-prototype`
* Mix and match with other libraries on NPM, such as [Ramda](ramdajs.com/docs/)

_Considerations_
* Event streams and FRP can be difficult to learn in the beginning, but can be great for abstracting complex asynchronous logic
* All html is generated from javascript code, and uzu modules do not use JSX
* The view functions are totally decoupled from the UI logic
* Very tiny size at less than 5kb

## Examples

#### Quick Example

A temperature converter between celsius and fahrenheit

_View: presentation layer_ `view.js`
```js
const h = require('uzu/h')

module.exports = function view (temps) {
  return h('div', [
    h('p', 'Convert between Fahrenheit and Celsius!')
  , input(temps.fahren, 'changeFahren')
  , input(temps.celsius, 'changeCelsius')
  ])
}

function input (value, actionName) {
  return h('input', {
    props: {type: 'text', value: value}
  , actions: {change: actionName}
  })
}
```

_Model: UI logic_ `convertTemps.js`
```js
const stream = require('uzu/stream')

module.exports = function convertTemps (fahrenChange$, celsiusChange$) {
  // Get the input values from the change event streams
  const fahrenVal$ = stream.map(ev => ev.currentTarget.value, fahrenChange$)
  const celsiusVal$ = stream.map(ev => ev.currentTarget.value, celsiusChange$)

  // Streams of converted values from the inputs
  const fahren$  = stream.map(c => c * 9 / 5 + 32, celsiusVal$)
  const celsius$ = stream.map(f => (f - 32) / 1.8, fahrenVal$)

  // Map key names to stream values for use in the view
  return stream.object({ fahren: fahren$, celsius: celsius$ })
}
```

_Render & Controller_ `page.js`
```js
const render = require('uzu/render')
const view = require('./view')
const convertTemps = require('./convertTemps')

// This is a top-level initialization function for the page
// It's responsible for routing the action streams from your DOM into your models
// This only needs to be called once per page
function controller (actions) {
  // actions() is a function that corresponds to the actions property from the view
  // It will fetch action streams from the DOM given an action name
  return convertTemps(actions('changeFahren'), actions('changeCelsius'))
}

// Render the UI to the page. We only need to call this render function once per page.
const container = document.querySelector('.uzu-render')
render(controller, view, container)
```

#### "7GUIs" Demos

[7GUIs]() is a helpful benchmark for frontend development using a set of example UI components that get progressively more complex.

* [**View the 7GUIs demo for Uzu**]()
* [**View the source code for each example component**]()

## Virtual DOM with the `h` function

Uzu uses [Snabbdom](github.com/snabbdom/snabbdom) under the hood for efficiently creating and updating HTML pages from javascript. We make use of the following Snabbdom modules:
* [props](https://github.com/snabbdom/snabbdom#the-props-module)
* [class](https://github.com/snabbdom/snabbdom#the-class-module)
* [attributes](https://github.com/snabbdom/snabbdom#the-attributes-module)
* [style](https://github.com/snabbdom/snabbdom#the-style-module)

Refer to the above links for documentation on how to use each of those plugins within your `h` function

## Event Stream API

Refer to the [**stream documentation**](https://github.com/jayrbolton/ev-stream) to see the full event stream API

## Getting Started

You can install Uzu via [npm](https://npmjs.org/package/uzu)

* You can require the `h` function using `require('uzu/h')`
* You can require the `render` function using `require('uzu/render')`
* You can require the `stream` library using `require('uzu/stream')`

#### Learn About Event Streams

One of the trickiest inital steps is to get a good handle on event streams. Try out this this tutorial to help your understanding:

[**Stream Tutorial**](/docs/event-stream-tutorial)

#### Todo Tutorial

The best way to get your bearings on the full Uzu workflow is to work through this tutorial:

[**Creating a Todo List Application in Uzu**](/docs/todo-tutorial.md)

#### Organizing your application

* Keep your view functions, Model constructor functions, and `render` code in separate files.
* Make directories for `views`, `models`, and `render`.
* Within each directory, all the js files can generally be kept flat, without further directory nesting. Sometimes you may find it useful to make sub-directories in the `models` or `views` directory with the names of resource types, such as `user` or `payment`.

An example directory structure is:

* `/client/models` -- contains all model functions
* `/client/views` -- contains all view functions
* `/client/lib` -- contains all utilities and helpers
* `/client/render` -- contains all js files that get included in `<script>` tags, which call the uzu `render` function.

## Boostrapping Framework (`uzu-prototype`)

Uzu includes a boostrapping framework with basic markup and styles for any web application. It is available on npm as `uzu-prototype` and documentation can be viewed here: **[https://github.com/uzujs/uzu-prototype](https://github.com/uzujs/uzu-prototype)**.

## Modules and Extensions

### Ajax

To make basic ajax requests and get the responses as FRP event streams, you can use:
[https://github.com/uzujs/uzu-ajax](https://github.com/uzujs/uzu-ajax)

The `Crud` library is a higher-level way of abstracting and managing resources over ajax:
[https://github.com/uzujs/uzu-crud](https://github.com/uzujs/uzu-crud)

### Undo functionality

To support rolling back data based on undo and redo events, use this library:
[https://github.com/uzujs/uzu-undo](https://github.com/uzujs/uzu-undo)

### URL and query strings

To track URL changes and manage the URL query string using event streams, use:
[https://github.com/uzujs/uzu-url](https://github.com/uzujs/uzu-url)

### Validate objects

To validate objects, such as when submitting forms:
[https://github.com/uzujs/uzu-validate](https://github.com/uzujs/uzu-validate)

### Datetimes

To manage dates and times set from inputs, converted into `moment` objects and automatically formatted, use this library:
[https://github.com/uzujs/uzu-datetime](https://github.com/uzujs/uzu-datetime)

### ChargeCard

### AutoCompletion

To support autocompleting inputs, use:

### Keyboard events

To get an event stream of keyboard input, use:
[https://github.com/uzujs/uzu-keyboard](https://github.com/uzujs/uzu-keyboard)

