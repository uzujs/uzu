const model = require('../../model')
const html = require('bel')
const dom = require('../../dom')
const history = require('../../undo-redo')

var id = 1
function Circle (x, y, radius) {
  return model({radius, x, y, id: id++, selected: false})
}

function CircleCollection () {
  const defaultDiameter = 100
  return model({
    circles: [],
    history: history.create(),
    selected: null,
    diameter: defaultDiameter,
    defaultDiameter
  })
}

function selectCircle (circle, coll) {
  if (coll.selected === circle) return
  if (coll.selected) coll.selected.update({selected: false})
  coll.update({selected: circle, diameter: circle.radius * 2})
  circle.update({selected: true})
}

function deselectCircle (coll) {
  if (coll.selected) coll.selected.update({selected: false})
  coll.update({selected: null, diameter: coll.defaultDiameter})
}

function toggleSelection (id, coll) {
  if (coll.selected && coll.selected.id === id) {
    deselectCircle(coll)
  } else {
    const circ = coll.circles.find(c => c.id === id)
    selectCircle(circ, coll)
  }
}

function createCircle ([x, y], coll) {
  const circle = Circle(x, y, coll.diameter / 2)
  // push the circle !
  const forward = () => {
    coll.circles.push(circle)
    selectCircle(circle, coll)
    coll.update({circles: coll.circles})
  }
  // pop the circle on undo
  const backward = () => {
    coll.circles.pop()
    coll.update({circles: coll.circles})
    deselectCircle(coll)
  }
  history.applyAction([forward, backward], coll.history)
}

function createOrSelect (event, coll) {
  if (event.target.tagName === 'circle') {
    // Select an existing circle
    const id = Number(event.target.getAttribute('data-id'))
    toggleSelection(id, coll)
  } else {
    // User clicked blank white space; create a new circle
    const x = event.offsetX
    const y = event.offsetY
    createCircle([x, y], coll)
  }
}

// Set the diameter for an existing circle
function setDiameter (event, coll) {
  const oldDiam = coll.diameter
  const newDiam = Number(event.currentTarget.value)
  const circle = coll.selected
  if (circle) {
    const forward = () => {
      coll.update({diameter: newDiam})
      circle.update({radius: newDiam / 2})
    }
    const backward = () => {
      coll.update({diameter: oldDiam})
      circle.update({radius: oldDiam / 2})
    }
    history.applyAction([forward, backward], coll.history)
  } else {
    coll.update({diameter: newDiam})
  }
}

function view (coll) {
  // svg and circle elements
  const g = html`<g stroke-width='1' stroke='black' fill='white'></g>`
  const circles = dom.childSync({
    view: circleView,
    container: g,
    model: coll,
    key: 'circles'
  })
  const svg = html`<svg onclick=${ev => createOrSelect(ev, coll)}> ${circles} </svg>`

  // inputs
  const slider = html`<input type='range' min=10 max=200 value=${coll.diameter} onchange=${ev => setDiameter(ev, coll)}>`
  coll.onUpdate('diameter', d => { slider.value = d })
  const undoBtn = html`<button onclick=${() => history.undo(coll.history)}> Undo </button>`
  const redoBtn = html`<button onclick=${() => history.redo(coll.history)}> Redo </button>`
  coll.history.onUpdate('undoStack', s => { undoBtn.disabled = !s.length })
  coll.history.onUpdate('redoStack', s => { redoBtn.disabled = !s.length })

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

const circleView = circle => {
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
