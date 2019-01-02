# :cyclone: uzu :cyclone:

Unfancy, highly modular UI components using a minimalistic library that combines [snabbdom](https://github.com/snabbdom/snabbdom) and [mitt](https://github.com/developit/mitt). Components are self-contained, self-updating, and self-patching. Components can be nested, composed, and interlinked in different ways.

To make a new component, pass a combination of a state object, event handlers, and a view function:
* state object: data used in the view
* event handlers: functions that can update the state
* view function: takes an instance of the component and returns a snabbdom vnode

You get back a state, an event emitter, and a snabbdom vnode
* state: same as what was passed in, with any updates from the events as time goes on
* event emitter: a mitt event emitter, with `.on` and `.emit` methods
* vnode: a snabbdom vnode. This is automatically patched after any event

Documentation on this library is still sparse. In the mean time, you can refer to the example code:

* [Counter list example](/examples/counters.js)

One unusual difference in this system is that subcomponents are embedded in parent views without any parameters passed, or any function called. Typically, an instance of a child component is saved in the parent component's state, then embedded in the view using the `.vnode` property:

```js
function ParentComponent () {
  return Component({
    // ...
    state: { childComponent: ChildComponent({ params }) },
    view: ({ state }) => {
      return h('div', [
        state.childComponent.vnode
      ])
    }
  })
}
```

## API

### Component({ state, events, view })

```js
const Component = require('uzu')

// ...

Component({ state, events, view })
```

### h(tagname, data, children)

```js
const h = require('uzu/h')

// ...
```

Refer to the [snabbdom]() documentation. This is exacty the same API as found for the `h()` function there.

The following snabbdom modules are automatically provided: props, style, class, eventlisteners, dataset, attributes

## Install

```
$ npm install uzu
```

## License

MIT

