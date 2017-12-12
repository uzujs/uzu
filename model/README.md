# uzu/model

Models are simple data containers that emit events when their properties change. [The code](./index.js) is a quick read.

```js
const Model = require('uzu/model')
```

You can use this module in conjuction with the [dom](/dom) module.

## Model(defaultData)

Make a new model! `defaultData` is an object of data that is immediately set on pageload.

```js
function BeanCount (initial) {
  return Model({ count: initial })
}
```

Model properties are strict: if you try to update a property in the state that wasnt initialized when the model is first created, then a TypeError will get thrown. This serves as a bug prevention / code readability measure.

## model.update(newData)

Merge in an object of `newData` into the model's current data. This is a shallow merge. An update event gets triggered for each key that you have set in `newData`

```js
const counter = BeanCount(0)
counter.update({count: 1})
counter.update({count: 2})
counter.update({x: 2}) // XXX Error! Undefined key
```

## state.onUpdate(key, fn)

Listen to updates on `key` and call `fn` any time an `update` function has changed that key's value.

```js
counter.onUpdate('count', function (count) {
  console.log('the new bean count is', count)
})
counter.update({count: 2}) // logs "the new bean count is 2"
```

You can make updates to models without triggering `onUpdate` listeners by simply not using `update`

```js
counter.count = 2 // no updates will trigger, this just mutates
counter.update({count: counter.count}) // any update callbacks now get triggered
```
