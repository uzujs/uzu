# :cyclone: uzu :cyclone:

Uzu is an ultra simple, expressive, and modular UI system for the web. It works with the plain DOM API and is inspired by state automatas, streams, and event emitters. 

Data in uzu is controlled with simple event emitter containers. They can be used to generate dynamic HTML (and svg and canvas) in a simpler (and possibly faster) way than virtual DOM. [The code](./index.js) for models is short and quick to read. Uzu also provides other UI related modules.

_Modules_
* [/model](/model)
* [/machine](/machine) (WIP)
* [/dom](/dom)
* [/canvas](/canvas) (WIP)
* [/undo-redo](/undo-redo)

**Examples!**
* [todo MVC](/examples/todo.js) (no styling)
* 7guis ([info](https://github.com/eugenkiss/7guis/wiki))
   * [counter](/examples/7guis/counter.js)
   * [temperature converter](/examples/7guis/temperature-converter.js)
   * [flight booker](/examples/7guis/flight-booker.js)
   * [timer](/examples/7guis/timer.js)
   * [crud](/examples/7guis/crud.js)
   * [circle-drawer](/examples/7guis/circles.js)
   * [cells](/examples/7guis/cells.js)
* [multiple dynamic counters](/examples/counter-many.js)
* [wikipedia search](/examples/wiki-search.js)


# Patterns & philosophy

## Modularity

Uzu is designed with different layers of modularity in mind.

* The same model can be initialized using different functions -- not bound to a single constructor
* Logic that changes a model lives outside the model and is decoupled from it
* Views are decoupled from models; the same model can be represented by many different views
* Models and logic can be encapsulated within a view, or live in a separate module
* Views can take any parameters that you want, and any number of models
* New models or other data can be returned by views, in addition to DOM nodes
* The same model object can span many different views and easily be used in different parts of the page
* Different views can reuse different instances of the same model

### Data & domain logic

Model constructors and functions that change models can live in their own files and their own modules and can be reused for different views. Generally, model constructors and logic do not need to live in the same file/module as the view functions; the view functions can import the model modules. The model modoules are pure domain logic (dynamic systems without any rendering), while the view modules are responsible for presentation.

### Views

A typical view takes model objects as parameters and returns an HTMLElement. Views can also initialize new model objects, pass them down to other views, or even return any extra data along with the DOM nodes. This way, models can easily bubble up and down through your tree of view functions.

View functions can use any library they want to generate plain [HTMLElements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement). `bel` is a good option, but any other library that generates DOM nodes would be fully compatible!

### Using other libs

You can freely use a lot of non-uzu, plain javascript libraries without special modifications, such as pell, pikaday, D3, chart.js, etc, etc. As long as the library works with plain DOM nodes, svg, or canvas, it is fully compatible -- no weird framework lock-in.

#### Mixin views

Often, the user of a view function wants to tweak a bunch of nested markup when they use a component. Instead of having your view construct any markup, it can be easier to have the user create all the markup themselves, while the view function takes the markup as a parameter and uses `data-*` attributes to add in functionality.

As long as the source markup has the right `data-*` attributes, the user can change up their markup however they want.

```js
// Here, "elem" is a user-supplied element that we are adding counter functionality into
function counterView (elem, startCount) {
  const counter = model({count: 1})
  const incrBtn = elem.querySelector('[data-bind="increment"]')
  const countTxt = elem.querySelector('[data-bind="count"]')
  incrBtn.addEventListener('click', () => counter.update({count: counter.count + 1}))
  counter.on('count', { c => countTxt.textContent = c })
  return elem
}
```

This way, the user can use any of the following three element "templates" to pass into the `counterView` function. All three `div` container examples below are fully compatible with the `counterView` function and will get the same functionality.

```html
<div class='counter1'>
  <button data-bind='increment'> Increment !!! </button>
  <p data-bind='count'></p>
</div>

<div class='counter1'>
  <div class='col-6'>
    <div class='xlarge' data-bind='count'></div>
  </div>
  <div class='col-6'>
    <a data-bind='increment'> add 1 </a>
  </div>
</div>

<div class='counter3>
  <button data-bind='increment' data-bind='count'>0</button>
</div>
```

### Presentation logic

Sometimes, you want to initialize and control some models, but you are fairly positive the logic doesn't need to be in a module, and doesn't need to be reused anywhere else. These states and code can simply get initialized and live inside your view function. Some examples include:
* Dropdown open/close state
* Tab swapping state
* Activating a sidebar
* Showing/hiding an input

In these cases, it may be simplest to keep these states hidden inside the view functions where they are needed. As soon as you realize you want to reuse the code elsewhere in your app, you can extract it into a separate module.
