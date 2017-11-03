const state = require('../../index')
const html = require('bel')
const dom = require('../../dom')
const undoRedo = require('../../undo-redo')

var id = 1
function Circle (x, y, radius) {
  return state({radius, x, y, id: id++, selected: false})
}

function CircleCollection () {
  const defaultDiameter = 100
  return state({
    circles: [],
    history: undoRedo.History(),
    selected: null,
    diameter: defaultDiameter,
    defaultDiameter
  })
}

const selectCircle = (collection, circle) => {
  if (collection.selected === circle) return
  if (collection.selected) collection.selected.update({selected: false})
  collection.update({selected: circle, diameter: circle.radius * 2})
  circle.update({selected: true})
}

const deselectCircle = (collection) => {
  if (!collection.selected) return
  collection.selected.update({selected: false})
  collection.update({selected: null, diameter: collection.defaultDiameter})
}

const createCircle = (collection, x, y) => {
  // We want to instantiate the circle only once
  const circle = Circle(x, y, collection.diameter / 2)
  // push the circle !
  const forward = () => {
    collection.circles.push(circle)
    selectCircle(collection, circle)
    collection.update({circles: collection.circles})
  }
  // pop the circle on undo
  const backward = () => {
    collection.circles.pop()
    collection.update({ circles: collection.circles })
    deselectCircle(collection)
  }
  undoRedo.applyAction(collection.history, forward, backward)
}

const toggleSelection = (collection, id) => {
  // toggle an existing selection off if user clicks already selected circle
  if (collection.selected && collection.selected.id === id) {
    deselectCircle(collection)
  } else {
    const circ = collection.circles.filter(c => c.id === id)[0]
    selectCircle(collection, circ)
  }
}

// coll = circleCollection
const createOrSelect = collection => event => {
  if (event.target.tagName === 'circle') {
    // Select an existing circle
    const id = Number(event.target.getAttribute('data-id'))
    toggleSelection(collection, id)
  } else {
    // User clicked blank white space; create a new circle
    const x = event.offsetX
    const y = event.offsetY
    createCircle(collection, x, y)
  }
}

// Set the diameter for an existing circle
const setDiameter = collection => event => {
  const history = collection.history
  const oldDiam = collection.diameter
  const newDiam = Number(event.currentTarget.value)
  const circle = collection.selected
  if (circle) {
    const forward = () => {
      collection.update({diameter: newDiam})
      circle.update({radius: newDiam / 2})
    }
    const backward = () => {
      collection.update({diameter: oldDiam})
      circle.update({radius: oldDiam / 2})
    }
    undoRedo.applyAction(history, forward, backward)
  } else {
    collection.update({diameter: newDiam})
  }
}

const undo = collection => () => undoRedo.undo(collection.history)
const redo = collection => () => undoRedo.redo(collection.history)

function view (collection) {
  // svg and circle elements
  const g = html`<g stroke-width='1' stroke='black' fill='white'></g>`
  const circles = dom.childSync({
    view: circleView(collection),
    container: g,
    state: collection,
    prop: 'circles'
  })
  const svg = html`<svg onclick=${createOrSelect(collection)}> ${circles} </svg>`

  // inputs
  const slider = html`<input type='range' min=10 max=200 value=${collection.diameter} onchange=${setDiameter(collection)}>`
  collection.on('diameter', d => { slider.value = d })
  const undoBtn = html`<button onclick=${undo(collection)}> Undo </button>`
  const redoBtn = html`<button onclick=${redo(collection)}> Redo </button>`
  const history = collection.history
  history.on('undoStack', b => { undoBtn.disabled = !b.length })
  history.on('redoStack', f => { redoBtn.disabled = !f.length })

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
  circle.on('selected', selected => {
    circElm.setAttribute('fill', selected ? '#888' : 'white')
  })
  circle.on('radius', r => {
    circElm.setAttribute('r', r)
  })
  return circElm
}

document.body.appendChild(view(CircleCollection()))
