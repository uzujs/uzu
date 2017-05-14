# :cyclone: uzu :cyclone:

> **PLEASE NOTE** This project is very much still in progress and experimental, and is not ready for widespread use

Uzu is a library for creating dynamic UI components on the web with javascript and functional reactive programming.

_Benefits_
* Keep large and complex single-page applications nicely organized
* Nest and compose your UI components
* Keep your apps snappy and responsive with FRP
* Easily create unit tests for your UI logic
* Bootstrap a new application quickly with `uzu-prototype`
* Mix and match with other libraries on NPM, such as [Ramda](ramdajs.com/docs/)

_Considerations_
* FRP (streams) can be difficult to learn in the beginning, but can be great for abstracting complex asynchronous logic
* All HTML is generated from javascript code, and uzu modules do not use JSX
* Uzu does not use or need virtual DOM, and is able to use a more efficient architecture
* Uzu encourages a strong separation between views and logic
* Very tiny size at less than 5kb

## At a glance

You can install `uzu` via [npm](https://npmjs.org/package/uzu)

* You can require the `h` function using `require('uzu/h')`
* You can require the `stream` library using `require('uzu/stream')`
* You can require the `modelView` function using `require('uzu/modelView')`

### Quick Example

A temperature converter between celsius and fahrenheit

```js
const stream = require('uzu/stream')
const modelView = require('uzu/modelView')
const h = require('uzu/h')

// This function contains our UI logic
const tempConvert = ({changeCelsius, changeFahren}) => {
  const celsius = stream.map(convertToCelsius, getNumValue(changeFahren))
  const fahren = stream.map(convertToFahren, getNumValue(changeCelsius))
  return {celsius, fahren}
}

// Utilities for tempConvert
const getNumValue = stream.map(ev => Number(ev.currentTarget.value))
const convertToCelsius = f => round((f - 32) / 1.8)
const convertToFahren = c => round(c * 1.8 + 32)
const round = n => Math.round(n * 100) / 100

const tempView = ({celsius, fahren}) => {
  return h('div', {}, [
    h('label', {}, ['Celsius'])
  , input(celsius, 'changeCelsius')
  , h('br', {}, [])
  , h('label', {}, ['Fahrenheit'])
  , input(fahren, 'changeFahren')
  ])
}

function input (value, inputName) {
  return h('input', {
    props: {type: 'number', value}
  , streams: {input: eventName}
  })
}

const {elm} = modelView(tempConvert, tempView)
document.body.appendChild(elm)
```

#### "7GUIs" Demos

[7GUIs]() is a helpful benchmark for frontend development using a set of example UI components that get progressively more complex.

* [**View the 7GUIs demo for Uzu**]()
* [**View the source code for each example component**]()

## `h` - DOM Element Creation

[:cat: **View the API** :dog:](/h)

Uzu generates HTML with the `h` function. This function will seem the same as functions from `virtual-dom`, `snabbdom`, etc. However, it is actually much simpler: it only generates [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) objects and does no diffing.

In other React-like libraries, view functions get re-executed on every state update. The virtual DOM tree is then diffed and patched on every state update. Instead, in Uzu, your view function is only called once on page load. Streams that are embedded in your views will update specific parts of your DOM individually without having to diff your entire DOM tree. This allows for much better performance potential and a simpler architecture.

## `stream` - Declarative UI Logic

[:beetle: **View the API** :honeybee:](/stream)

Streams are the core engine of Uzu and allow you to manage delayed and repeating values like clicks, ajax, etc. in a very declarative and functional way.

## `modelView` - Tying it All Together

[:dolphin: **View the API** :whale2:](/modelView)

The `modelView` function allows you to decouple your UI logic from your views. In some contexts, this is known as separating your "presentation layer" from your "domain logic layer". 

"Models" are functions that take event streams as parameters and return an object of result streams. Examples include saving users to a server, reading the Wikipedia API, formatting dates and times, etc.

"Views" are functions that take the result streams from the model functions and return event streams.

```
function model (eventStreams) {
  // returns resultStreams
}
function view (resultStreams) {
  // returns eventStreams
}

modelView(model, view)
```

## Howtos and Tutorials

#### Event Stream Intuition

One of the trickiest inital steps is to get a good handle on event streams. Try out this this tutorial to help your understanding:

[**Stream Tutorial**](/docs/event-stream-tutorial)

#### Counter Tutorial

The best way to get your bearings on the full Uzu workflow is to work through this tutorial:

[**Creating Uzu components, step-by-step**](/docs/todo-tutorial.md)

## Boostrapping Framework (`uzu-prototype`)

Uzu includes a boostrapping framework with basic markup and styles for any web application. It is available on npm as `uzu-prototype` and documentation can be viewed here: **[https://github.com/uzujs/uzu-prototype](https://github.com/uzujs/uzu-prototype)**.

## Modules and Extensions

### Ajax

To make basic ajax requests and get the responses as FRP event streams, use:
[https://github.com/uzujs/uzu-ajax](https://github.com/uzujs/uzu-ajax)

The `Crud` library is a higher-level way of abstracting and managing resources over ajax:
[https://github.com/uzujs/uzu-crud](https://github.com/uzujs/uzu-crud)

### Undo functionality

To support rolling back data based on undo and redo events, use:
[https://github.com/uzujs/uzu-undo](https://github.com/uzujs/uzu-undo)

### URL and query strings

To track URL changes and manage the URL query string using event streams, use:
[https://github.com/uzujs/uzu-url](https://github.com/uzujs/uzu-url)

### Validate objects

To validate objects, such as when submitting forms:
[https://github.com/uzujs/uzu-validate](https://github.com/uzujs/uzu-validate)

### Datetimes

To manage dates and times set from inputs, converted into `moment` objects and automatically formatted, use:
[https://github.com/uzujs/uzu-datetime](https://github.com/uzujs/uzu-datetime)

### ChargeCard

### AutoCompletion

To support autocompleting inputs, use:

### Keyboard events

To get an event stream of keyboard input, use:
[https://github.com/uzujs/uzu-keyboard](https://github.com/uzujs/uzu-keyboard)

