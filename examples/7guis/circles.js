const {h, component, debug} = require('../..')

selector component({
  state: {selected: false},
  receive: {
    deselect: x
    select: x
    toggle: x
  }
})

system({
  selection: selection,
  click: event('toggle'),
})

system({
  svg: svg,
  diameter: component({
    state: {diameter: 50},
    receive: {
      'svg:circles:selected': (s, c, {diameter}) => {
        return {diameter: c.diameter}
      }
    }
  })
})


function Circle ({x, y, radius, id}) {
  return component({
    state: {x, y, radius, id, selected: true},
    on: {
      toggleSelect: (_, {selected}) => ({selected: !selected}),
      deselect: () => ({selected: false}),
      setRadius: r => ({radius: r})
    },
    view: function (state, emit) {
      return h('circle', {
        key: state.id,
        on: {
          click: () => emit('toggleSelect')
        },
        style: {cursor: 'pointer'},
        attrs: {
          'cx': state.x,
          'cy': state.y,
          'r': state.radius,
          'fill': state.selected ? 'lightgrey' : 'white',
          'data-id': state.id
        }
      })
    }
  })
}

function Svg () {
  return component({
    state: {circles: [], diameter: 50},
    on: {
      setDiameter: (diameter, state) => {
        state.circles.filter(c => c.state.selected).forEach(c => {
          c.emit('setRadius', diameter / 2)
        })
        return {diameter}
      },
      createCircle: (ev, state, emit) => {
        if (ev.target.tagName === 'circle') return
        state.circles.filter(c => c.state.selected).forEach(c => {
          c.emit('deselect')
        })
        const x = ev.offsetX
        const y = ev.offsetY
        const id = Math.random()
        const circle = Circle({x, y, radius: state.diameter / 2, id: id})
        // Toggle off other circles when a circle is selected
        circle.on('toggleSelect', () => {
          // Circle was selected
          if (circle.state.selected) {
            // Deselect any other selected circles
            state.circles.filter(c => c.state.id !== circle.state.id && c.state.selected).forEach(c => {
              c.emit('deselect')
            })
            emit('setDiameter', circle.state.radius * 2)
          }
        })
        const circles = state.circles.concat([circle])
        return {circles}
      },
      select: (circle, state, emit) => {
        const diameter = circle.state.radius * 2
        return {diameter}
      }
    },
    view: function (state, emit) {
      return h('svg', {
        on: {click: ev => emit('createCircle', ev)}
      }, [
        h('g', {
          attrs: {
            'stroke-width': '1',
            'stroke': 'black',
            'fill': 'white'
          }
        }, state.circles.map(c => {
          return h('g', {
            on: {click: () => emit('select', c)}
          }, [ c.vnode ])
        }))
      ])
    }
  })
}

function CircleController () {
  const svg = Svg()
  return component({
    state: {svg, diameter: 50},
    receive: {
      setDiameter: (diameter) => {
        return {diameter}
      }
    },
    view: (state, emit) => {
      return h('div', {
        style: {textAlign: 'center'}
      }, [
        h('style', {
          props: {
            innerHTML: (`
              body { background-color: #efefef; }
              svg {
                cursor: pointer;
                width: 600px;
                height: 400px;
                background-color: white;
                border: 1px solid black;
              }
            `)
          }
        }),
        h('label', ['Diameter: ', state.diameter]),
        h('input', {
          emit: {input: 'setDiameter'},
          props: {type: 'range', min: 10, max: 500, value: state.svg.state.diameter},
          on: {input: ev => emit('setDiameter', ev.currentTarget.value)}
        }),
        svg.view(svg.state, svg.emit)
      ])
    }
  })
}

const circles = CircleController()

document.body.appendChild(circles.node)

/**
 * This example uses the "command pattern", where every undo-able or redo-able action is described
 * by a "command", which is an object with a .redo and .undo function. The commands are set up so
 * that the undo function is an inverse of the redo function. The functions use their closure data for their state.
 *
 * Many undo-redo examples you find elsewhere, like Om, use immutability for undo-redo and
 * emphasize its ease of use. I would argue that in real life applications, simply rolling back
 * immutable state is not a valid solution. You actually need a command-based undo/redo stack,
 * where each command may need to do server requests, local storage operations, etc, etc
 */

/*
function Circle (x, y, radius, id) {
  return component({
    scope: ['circle', id],
    state: {radius, x, y, id, selected: false}
  })
}

// Manage a collection of all circles
const defaultDiameter = 100
component({
  scope: ['circles-controller'],
  state: {
    circles: [],
    undoStack: [],
    redoStack: [],
    diameter: defaultDiameter,
    defaultDiameter,
    selectedCircle: null
  },
  on: {
    select: function (id, {selectedCircle}) {
      if (id === null || selectedCircle === id) {
        // Toggle off
        return {selectedCircle: null}
      }
      const radius = get(['circle', id]).radius
      return {selectedCircle: id, diameter: radius * 2}
    },
    create: function ([x, y], {diameter, undoStack}) {
      var id = Math.random() // poor person's uid
      const command = {
        redo: () => {
          Circle(x, y, diameter / 2, id)
          emit(['circles-controller'], 'select', id)
        },
        undo: () => {
          del(['circle', id])
          emit(['circles-controller'], 'merge', {selectedCircle: null})
        }
      }
      command.redo()
      undoStack.push(command)
      return {undoStack, redoStack: []}
    },
    tweakDiameter: function (newDiam, {selectedCircle}) {
      // Provides more real-time updates as you tweak the slider
      // Does not affect the undo stack
      if (!selectedCircle) return
      emit(['circle', selectedCircle], 'merge', {radius: newDiam / 2})
    },
    setDiameter: function (newDiam, {diameter, undoStack, selectedCircle}) {
      // Undoable/redoable action to set the diameter
      const oldDiam = diameter
      const circleID = selectedCircle
      const set = (diam) => {
        if (get(['circle', circleID])) {
          emit(['circle', circleID], 'merge', {radius: diam / 2})
        }
        emit(['circles-controller'], 'merge', {diameter: diam})
      }
      // Uses the closure (newDiam/oldDiam) data for undo and redo actions
      const command = {
        redo: () => set(newDiam),
        undo: () => set(oldDiam)
      }
      undoStack.push(command)
      command.redo()
      return {undoStack, redoStack: []}
    },
    del: function (id, {undoStack, selectedCircle}) {
      if (!id) {
        if (!selectedCircle) throw new Error('No circle selected; cannot delete')
        id = selectedCircle
      }
      const circle = get(['circle', id])
      const command = {
        redo: () => {
          del(['circle', id])
          emit(['circles-controller'], 'merge', {selectedCircle: null})
        },
        undo: () => {
          // Recreate the deleted circle with the same properties
          Circle(circle.x, circle.y, circle.radius, circle.id)
          emit(['circles-controller'], 'merge', {selectedCircle: id})
        }
      }
      command.redo()
      undoStack.push(command)
      return {undoStack, redoStack: []}
    },
    undo: function (_, {undoStack, redoStack}) {
      if (!undoStack.length) throw new Error('No history to undo')
      // Move a command from the undoStack to the redoStack
      // (you can redo an undo action)
      const command = undoStack.pop()
      command.undo()
      redoStack.push(command)
      return {undoStack, redoStack}
    },
    redo: function (_, {undoStack, redoStack}) {
      if (!redoStack.length) throw new Error('No redo actions')
      // Move a command from the redoStack to the undoStack
      // (you can undo a redo action)
      const command = redoStack.pop()
      command.redo()
      undoStack.push(command)
      return {undoStack, redoStack}
    }
  }
})

// From a click event on the SVG element, either create a new circle or select an existing one
function createOrSelect (event) {
  if (event.target.tagName === 'circle') {
    // Select an existing circle
    const id = Number(event.target.getAttribute('data-id'))
    emit(['circles-controller'], 'select', id)
  } else {
    // User clicked blank white space; create a new circle
    const x = event.offsetX
    const y = event.offsetY
    emit(['circles-controller'], 'create', [x, y])
  }
}

function view () {
  const circlesController = get(['circles-controller'])
  const circles = get(['circle', '*'])

  return h('div', { style: {textAlign: 'center'} }, [
    h('style', {
      props: {
        innerHTML: (`
          body { background-color: #efefef; }
          svg {
            cursor: pointer;
            width: 600px;
            height: 400px;
            background-color: white;
            border: 1px solid black;
          }
        `)
      }
    }),
    h('p', 'Click the white area to create a circle'),
    h('p', 'Click a white circle to select it and change diameter -- the selected circle is grey'),
    h('div', [
      h('button', {
        props: {disabled: !circlesController.selectedCircle},
        on: {click: ev => emit(['circles-controller'], 'del')}
      }, 'Delete'),
      h('button', {
        on: {click: () => emit(['circles-controller'], 'undo')},
        props: {disabled: !circlesController.undoStack.length}
      }, 'Undo'),
      h('button', {
        on: {click: () => emit(['circles-controller'], 'redo')},
        props: {disabled: !circlesController.redoStack.length}
      }, 'Redo')
    ]),
    h('div', [
      h('label', 'Diameter'),
      h('input', {
        props: {
          type: 'range',
          max: '200',
          min: '10',
          value: circlesController.diameter
        },
        on: {
          change: ev => emit(['circles-controller'], 'setDiameter', ev.currentTarget.value),
          input: ev => emit(['circles-controller'], 'tweakDiameter', ev.currentTarget.value)
        }
      })
    ]),
    h('svg', {
      on: {click: ev => createOrSelect(ev)}
    }, [
      h('g', {
        attrs: {
          'stroke-width': '1',
          'stroke': 'black',
          'fill': 'white'
        }
      }, circles.map(circleView))
    ])
  ])
}

function circleView (circle) {
  const selectedID = get(['circles-controller']).selectedCircle
  const selected = selectedID === circle.id
  return h('circle', {
    attrs: {
      'cx': circle.x,
      'cy': circle.y,
      'r': circle.radius,
      'fill': selected ? '#888' : 'white',
      'data-id': circle.id
    }
  })
}

const container = document.createElement('div')
document.body.appendChild(container)
render(container, view)
*/
