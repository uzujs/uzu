# :cyclone: uzu :cyclone:

> **PLEASE NOTE** This project is very much still in progress and experimental, and is not ready for use

Uzu is a library for creating dynamic UI components on the web with javascript and functional reactive programming.

## At a glance

Uzu consists of two main parts:
* A [`stream`](/stream) library for managing UI logic
* An [`h`](/html) function and [`modelView`](/html) function for rendering markup

### Quick Examples

View the [/examples](/examples) folder to view some working mini-apps. You can run a server for any of those examples easily with budo (`npm install -g budo`) by running `budo examples/multi-counter.js`.

Here is a temperature converter between celsius and fahrenheit

```js
const stream = require('uzu/stream')
const {h, modelView} = require('uzu/html')

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
    h('label', {}, 'Celsius')
  , input(celsius, 'changeCelsius')
  , h('br', {}, [])
  , h('label', {}, 'Fahrenheit')
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

