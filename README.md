# :cyclone: uzu :cyclone:

Uzu is a library for creating UI components on the web using virtual DOM (powered by [Snabbdom](https://github.com/snabbdom/snabbdom)) combined with functional reactive programming.

* Embraces functional programming with no mutations, globals, or spaghetti code
* Has a strong separation between the logic and presentation layers in your UI
* Rendering and patching changes to the DOM is extremely fast using Snabbdom and efficient subtree patching
* Allows for very easy unit testing of UI logic
* Has a very thorough collection of helper libraries, plus a separate boostrapping framework
* Is plain JS and part of the normal npm ecosystem
* Very tiny size at only `5kb`

In Uzu, the UI logic is totally decoupled from the presentation layer (ie. the view functions). You create independent **Models** that are plain javascript objects containing event streams. Instances of these models can be passed around freely among different **view functions**. Models are modular and can be nested and composed. The same goes for view functions, which can also be nested. However, an important differentiator of Uzu from other frameworks is that **the tree hierarchy of the models and the views is totally decoupled**. This makes it easier to manage logic across complex single-page apps.

## Examples

#### "7GUIs" Demos

[7GUIs]() is a helpful benchmark for frontend development using a set of example UI components that get progressively more complex.

* [**View the 7GUIs demo for Uzu**]()
* [**View the source code for each example component**]()

#### Quick Example

Convert temperatures between celsius and fahrenheit:

```js
// Require the three core uzu modules
const h = require('uzu/h')
const stream = require('uzu/stream')
const render = require('uzu/render')

// This is a model constructor with event-stream logic for temperature conversions
function Temps () {
  // First, create a couple input event streams that are initially empty
  const input = {celsius$: stream.create(), fahren: stream.create()}

  // Then create a couple streams derived from the inputs that perform the conversions
  const celsius$ = stream.map(fahrenToCelsius, input.celsius$)
  const fahren$  = stream.map(celsiusToFahren, input.fahren$)

  // The return object can contain any values that you want
  return {input, celsius$, fahren$}
}


function view (temps) {
  return h('div', [
    h('p', 'Convert between Fahrenheit and Celsius!')
  , input(temps.fahren$, temps.input.fahren$)
  , input(temps.celsius$, temps.input.celsius$)
  ])
}

function input (output$, input$) {
  return h('input', {
    props: {type: 'text', value: output$()}
  , on: {change: ev => input$(ev.currentTarget.value)}
  })
}

// Initialize our model
const temps = Temps()
// Get a container to render into
const container = document.querySelector('.uzu-render')
// Render the UI to the page. We only need to call this render function once per page.
render(view, temps, container)
```

## Virtual DOM

Uzu uses [Snabbdom](github.com/snabbdom/snabbdom) under the hood for efficiently creating and updating HTML pages from javascript. We make use of the following Snabbdom modules:
* [eventlisteners](https://github.com/snabbdom/snabbdom#eventlisteners-module)
* [props](https://github.com/snabbdom/snabbdom#the-props-module)
* [class](https://github.com/snabbdom/snabbdom#the-class-module)
* [attributes](https://github.com/snabbdom/snabbdom#the-attributes-module)
* [style](https://github.com/snabbdom/snabbdom#the-style-module)

Refer to the above links for documentation on how to use each of these features.

## Event Stream API

Refer to the [**stream documentation**](/stream) to see the full event stream API

## Getting Started

You can install Uzu via [npm](https://npmjs.org/package/uzu)

* You can require the `h` function using `require('uzu/h')`
* You can require the `render` function using `require('uzu/render')`
* You can require the `stream` library using `require('uzu/stream')`

#### Learn About Event Streams

One of the trickiest inital steps is to get a good handle on event streams. Try out this this tutorial to help your understanding:

[**Event Stream Tutorial**](/docs/event-stream-tutorial)

#### Todo Tutorial

The best way to get your bearings on the full Uzu workflow is to work through this tutorial:

[**Creating a Todo List Application in Uzu**](/docs/todo-tutorial.md)

#### Organizing your application

* Keep your view functions and Model constructors in separate files. 
* You can keep all your model and view files in a flat directory
* Keep a special directory for JS that is included in script tags on the page and calls the `render` function

An example directory structure is:

* `/client/models` -- contains all model constructor functions
* `/client/views` -- contains all view functions
* `/client/lib` -- contains all utilities and helpers
* `/client/render` -- contains all js files that get included in `<script>` tags. These files call the uzu `render` function. 

## Boostrapping Framework

## Modules and Extensions

#### Ajax and CRUD

#### Undo functionality

#### URL and query strings

#### ValidatedObject

#### DateTime

#### ChargeCard

#### AutoCompletion

#### Keyboard events

