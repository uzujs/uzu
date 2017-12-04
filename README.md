# :cyclone: uzu :cyclone:

Uzu is an ultra simple, expressive, and modular UI system for the web. It works with the plain DOM API and is inspired by streams, statecharts, and other dynamic systems.

_Modules_
* [/model](/model) -- save and set data
* [/statechart](/statechart) -- stateless state graphs
* [/dom](/dom) -- helpers for rendering elements
* [/canvas](/canvas) -- work in progress
* [/undo-redo](/undo-redo) -- action-based undo/redo functionality

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

* Models and statecharts are designed to prevent spaghetti code
* UI can be controlled in a declarative way with statecharts
* Views are decoupled from models; the same model can be represented by many different views
* Models and logic can live in separate modules and files
* Views can take any parameters that you want, and any number of models
* New models or other data can be returned by views, in addition to DOM nodes
* The same model object can span many different views and easily be used in different parts of the page
* Different views can reuse different instances of the same model

### Using other libs -- no weird framework lock-in

You can freely use a lot of plain javascript libraries without special modifications, such as pell, pikaday, D3, chart.js, etc, etc. As long as the library works with plain DOM nodes, svg, or canvas, it is fully compatible.

On the flipside, any module you create in uzu will look like a plain-JS, plain-DOM library, and your users don't need to use or know about this library.
