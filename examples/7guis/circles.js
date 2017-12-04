const model = require('../../model')
const html = require('bel')
const dom = require('../../dom')
const History = require('../../undo-redo')

var id = 1
function Circle (x, y, radius) {
  return model({radius, x, y, id: id++, selected: false}, {
    setRadius: (rad, c, update) => update({radius: rad}),
    toggleSelect: (_, c, update) => update({selected: !c.selected})
  })
}

function CircleCollection () {
  const defaultDiameter = 100
  return model({
    circles: [],
    history: History(),
    selected: null,
    diameter: defaultDiameter,
    defaultDiameter
  }, {
    selectCircle: (circle, coll, update) => {
      if (coll.selected === circle) return
      if (coll.selected) coll.selected.actions.toggleSelect()
      update({selected: circle, diameter: circle.radius * 2})
      circle.actions.toggleSelect()
    },
    deselectCircle: (_, coll, update) => {
      if (coll.selected) coll.selected.actions.toggleSelect()
      update({selected: null, diameter: coll.defaultDiameter})
    },
    toggleSelection: (id, coll, update) => {
      if (coll.selected && coll.selected.id === id) {
        coll.actions.deselectCircle()
      } else {
        const circ = coll.circles.filter(c => c.id === id)[0]
        coll.actions.selectCircle(circ)
      }
    },
    createCircle: ([x, y], coll, update) => {
      const circle = Circle(x, y, coll.diameter / 2)
      // push the circle !
      const forward = () => {
        coll.circles.push(circle)
        coll.actions.selectCircle(circle)
        update({circles: coll.circles})
      }
      // pop the circle on undo
      const backward = () => {
        coll.circles.pop()
        update({circles: coll.circles})
        coll.actions.deselectCircle()
      }
      coll.history.actions.applyAction([forward, backward])
    },
    createOrSelect: (event, coll, update) => {
      if (event.target.tagName === 'circle') {
        // Select an existing circle
        const id = Number(event.target.getAttribute('data-id'))
        coll.actions.toggleSelection(id)
      } else {
        // User clicked blank white space; create a new circle
        const x = event.offsetX
        const y = event.offsetY
        coll.actions.createCircle([x, y])
      }
    },
    // Set the diameter for an existing circle
    setDiameter: (event, coll, update) => {
      const oldDiam = coll.diameter
      const newDiam = Number(event.currentTarget.value)
      const circle = coll.selected
      if (circle) {
        const forward = () => {
          update({diameter: newDiam})
          circle.actions.setRadius(newDiam / 2)
        }
        const backward = () => {
          update({diameter: oldDiam})
          circle.actions.setRadius(oldDiam / 2)
        }
        coll.history.actions.applyAction([forward, backward])
      } else {
        update({diameter: newDiam})
      }
    }
  })
}

function view (collection) {
  // svg and circle elements
  const g = html`<g stroke-width='1' stroke='black' fill='white'></g>`
  const circles = dom.childSync({
    view: circleView(collection),
    container: g,
    model: collection,
    prop: 'circles'
  })
  const svg = html`<svg onclick=${collection.actions.createOrSelect}> ${circles} </svg>`

  // inputs
  const slider = html`<input type='range' min=10 max=200 value=${collection.diameter} onchange=${collection.actions.setDiameter}>`
  collection.onUpdate('diameter', d => { slider.value = d })
  const undoBtn = html`<button onclick=${collection.history.actions.undo}> Undo </button>`
  const redoBtn = html`<button onclick=${collection.history.actions.redo}> Redo </button>`
  const history = collection.history
  history.onUpdate('undoStack', b => { undoBtn.disabled = !b.length })
  history.onUpdate('redoStack', f => { redoBtn.disabled = !f.length })

  return html`
    <div style='text-align: center'>
      <style>
        body {
          background-color: #efefef;
        }
        svg {
          cursor: pointer;
          width: 600px;
          height: 400px;
          background-color: white;
          border: 1px solid black;
        }
      </style>
      <p> Click the white area to create a circle </p>
      <p> Click a white circle to select it and change diameter -- the selected circle is grey </p>
      <div>
        ${undoBtn}
        ${redoBtn}
      </div>
      <div>
        <label> Diameter: </label>
        ${slider}
      </div>
      ${svg}
    </div>
  `
}

const circleView = collection => circle => {
  const circElm = html`<circle cx=${circle.x} cy=${circle.y} r=${circle.radius} data-id=${circle.id}>`
  circle.onUpdate('selected', selected => {
    circElm.setAttribute('fill', selected ? '#888' : 'white')
  })
  circle.onUpdate('radius', r => {
    circElm.setAttribute('r', r)
  })
  return circElm
}

document.body.appendChild(view(CircleCollection()))
