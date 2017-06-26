# Creating DOM elements in Uzu

You can create DOM elements with objects that have the following keys:

- `tag`: tagName of the element (div, p, span, etc)
- `props`: a nested object of property assignments you want to make (value, disabled, etc)
- `attrs`: a nested object of attributes you want to set with `element.setAttribute`. If the value of an attribute name is `null` or `undefined`, then that at
tribute will get removed
- `on`: a nested object whose keys are event listener names ("click", "hover", etc), and whose values are event-handler functions that will get called with event objects.
- `children`: all the child elements underneath this element (see below)
  
`children` can be one of:

- An array of **child nodes**
- A stream of arrays of child nodes

A **child node** can be one of:

- A **vnode**
- A primitive value, like a string or number
- A stream of primitive values

This library exports a single function that takes a tree of node objects, described above, and returns a real DOM node, which you can append to the page.

## Custom Updaters

You can pass in a set of custom updater functions for custom properties on your vnodes. These updater functions take the element node, a name, and a value as arguments.

```
const div = {tag: 'div', style: {color: 'blue'}}
const elm = createElm(div, {color: (elm, n, v) => elm.style[n] = v})
```
