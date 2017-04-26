# uzu

Uzu is a library for creating UI components on the web using functional reactive programming with event streams, combined with the virtual DOM powered by Snabbdom.

In Uzu, the UI logic is totally decoupled from the presentation layer (ie. the view functions). You create independent **Models** that are plain javascript objects containing event streams. Instances of these models can be passed around freely among different view functions. Models are modular and can be nested and composed. The same goes for view functions, which can also be nested. However, an important differentiator of Uzu from other frameworks is that **the tree hierarchy of the models and the views is totally decoupled**. This makes it easier to manage logic across complex single-page apps.

Rendering and patching changes to the DOM is extremely fast using Snabbdom and efficient subtree patching (ie. sub-elements of the DOM get re-rendered and patched individually).

## Quick Example

Convert temperatures between celsius and fahrenheit:

```js
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
// Render the UI to the page
render(view, temps, container)
```

## Getting Started

## Virtual DOM

## Event Streams


