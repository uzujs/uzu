# Creating DOM elements in Uzu

## h(selector, options, children)

`h` is a curried function with 3 parameters:

* `selector`: a CSS-like string selector that starts with the tagname. You can append any class names you want separated by dots. For example: `'div.x.y.z'`
* `options`: options is an object that allows you to set properties, classes, attributes, and event streams for the node (see below)
* `children`: This is either a single value or an array of values. If any of these values are streams, then this DOM node will update for every value in the stream.

### props

`props` is a key that you can use in `options` to assign properties. Any assignable property on an [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) and its child classes (eg. HTMLAnchorElement) can be set here. Examples include href, target, type, value, etc.

```js
h('input', {props: {type: 'text', value: 'hi'}}, [])
// Yields this HTML:
// <input type='text' value='hi'>
```

### class

`class` is a key that you can use in `options` to set classNames. `class` should be an object where each key is a class name and each value is a boolean. If the boolean is true, add that class to the element. If the boolean is false, the class is removed from the element.

```js
h('div', {class: {x: true, y: false, z: true}}, [])
// Yields this HTML:
// <div class='x z'></div>
```

### attrs

`attrs` is a key that you can use in `options` to set attributes using `setAttribute`. If the attribute value is `undefined`, then the attribute will get removed from the node using `removeAttribute`:

```js
h('div', {attrs: {x: 1, y: undefined, z: 1}}, [])
// Yields this HTML:
// <div x='1' z='1'></div>
```

### streams

`streams` is a key that you can use in `options` to generate output streams for this node. All streams will contain event objects.

```js
const {streams} = h('button', {streams: {click: 'click'}}, 'Increment counter')
const count = stream.scan(n => n + 1, 0, streams.click)
h('p', {}, ['Count is ', count])
```

