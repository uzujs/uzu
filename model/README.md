# uzu models

Models contain data and will emit events when any properties change. That's it!

## model(defaults)

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
