# uzu models

Models contain data and will emit events when any properties change. You can also define actions that they can accept, which cause updates in the model.

## Model(defaultData, actions)

Make a new model! `defaultData` is an object of data that is immediately set on pageload. `actions` is an object of event names and updater functions.

Each actio n function can take arguments for `(yourData, model, update)` where:
* `yourData` is any arbitrary data passed into the action
* `model` is the model itself
* `update` is a function that takes an object of new properties to merge into the model

```js
const Model = require('uzu/model')
function BeanCount (initial) {
  return Model(
    { count: initial },
    { addBeans: (n, {count}, update) => update({count: count + n}) }
  )
}
```

Model properties are strict: if you try to update a property in the state that wasnt initialized when the state is first created, then a TypeError will get thrown. This is a bug prevention / code readability measure.

## state.onUpdate(prop, fn)

Listen to changes on `prop` and call `fn` any time an updater action has changed that prop.

```js
beanCount.onUpdate('count', (c) => console.log('count updated to', c))
```
