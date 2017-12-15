# :cyclone: uzu :cyclone:

Uzu is an ultra small, expressive, and modular UI library that is designed to be simple and practical. It works closely with the plain DOM API.

_Modules_
* **[/channel](/channel)** -- handle dynamic data
* **[/dom](/dom)** -- utilities for rendering DOM nodes efficiently
* **[/statechart](/statechart)** -- design UI with state machines
* **[/canvas](/canvas)** -- render canvas animations (WIP)
* **[/undo-redo](/undo-redo)** -- action-based undo/redo functionality

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

Uzu is designed to be close to the metal. It doesn't abstract very much over built-in javascript, but provides just enough tools to keep things clean and efficient.

## Modularity

Uzu is designed with different layers of modularity in mind. A main goal is to allow people to write small and composable pieces.

* Views are decoupled from business logic; the same set of channels can be represented by many different views
* Channels and logic can live in separate modules and files from the views
* Functions that update channels are decoupled from the channels themselves
* UI state can be designed in a top-down, declarative way with statecharts
* Views can take any parameters that you want, and any number of channels
* New channels or other data can be returned by views, in addition to DOM nodes
* The same channel can span many different views and easily be used in different parts of the page
* Different views can reuse different instances of the same channel

In uzu, the views are the "origin of behavior". In other words, if you are trying to figure out why a certain button behaves in a certain way, you can find out by going to the button's view function, and then tracing its behavior from there.

### Using other libs -- no weird framework lock-in

You can freely use a lot of plain javascript libraries without special modifications, such as pell, pikaday, D3, chart.js, etc, etc. As long as the library works with plain DOM nodes, svg, or canvas, it is fully compatible.

On the flipside, any module you create in uzu will look like a plain-JS, plain-DOM library, and your users don't need to use or know about this library.
