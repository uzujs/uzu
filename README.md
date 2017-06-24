# :cyclone: uzu :cyclone:

> **PLEASE NOTE** This project is very much still in progress and experimental, and is not ready for use

Uzu is a library for creating dynamic UI components on the web with javascript and functional reactive programming.

## At a glance

Uzu consists of two main parts:
* A [`stream`](/stream) library for managing data that changes over time
* An [`dom`](/html) library and for generating DOM elements from plain-JS objects and streams

### Quick Examples

View the [/examples](/examples) folder to view some working mini-apps. You can run a server for any of those examples easily with budo (`npm install -g budo`) by running `budo examples/multi-counter.js`.

Here is a quick counter component to get you started

```js
const stream = require('uzu/stream')
const createElm = require('uzu/html')
const R = require('ramda')

// UI logic for a single counter
const Counter = initial => ({increment, decrement, reset}) =>
 stream.scanMerge([
    [increment, R.add(1)]
  , [decrement, R.add(-1)]
  , [reset,     R.always(0)]
  ], initial)
  
const view = counter => ({
    tag: 'div'
  , props: {id: stream.map(R.prop('id'), counter.output)}
  , children: [
      'Current count is '
    , stream.map(R.prop('count'), counter.output)
    , btn(counter.input.increment, 'Increment')
    , btn(counter.input.decrement, 'Decrement')
    , btn(counter.input.reset, 'Reset')
    ]
  })

const render = () => {
  const vtree = view(stream.model(Counter(0)))
  const elm = createElm(vtree)
  document.body.appendChild(elm)
}
render()

```

