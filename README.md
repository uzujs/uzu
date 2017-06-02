# :cyclone: uzu :cyclone:

> **PLEASE NOTE** This project is very much still in progress and experimental, and is not ready for use

Uzu is a library for creating dynamic UI components on the web with javascript and functional reactive programming.

## At a glance

Uzu consists of two main parts:
* A [`stream`](/stream) library for managing UI logic using event streams
* An [`h`](/html) function and for generating HTMLElements

### Quick Examples

View the [/examples](/examples) folder to view some working mini-apps. You can run a server for any of those examples easily with budo (`npm install -g budo`) by running `budo examples/multi-counter.js`.

Here is a quick counter component to get you started

```js
const stream = require('uzu/stream')
const h = require('uzu/html')

const counter = (initial) => {
  const incBtn = h('button', {}, 'Increment')
  const inc = stream.fromEvent('click', incBtn)
  const decBtn = h('button', {}, 'Decrement')
  const dec = stream.fromEvent('click', decBtn)
  
  const count = counterModel(inc, dec, initial)
  const p = h('p', ['Count is ', count])
  
  return h('div', {}, [incBtn, decBtn, p])
}

const counterModel = (inc, dec, initial) =>
  stream.scanMerge([
    [inc, (count) => count + 1]
  , [dec, (count) => count - 1]
  ], initial)

document.body.appendChild(counter(0))
```

