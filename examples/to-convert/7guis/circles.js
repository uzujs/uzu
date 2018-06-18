const channel = require('../../channel')
const html = require('bel')
const dom = require('../../dom')
const history = require('../../undo-redo')

var id = 1
function Circle (x, y, radius) {
  return {radius: channel(radius), x, y, id: id++, selected: channel(false)}
}

function CircleCollection () {
  const defaultDiameter = 100
  return {
    circles: channel([]),
    history: history.create(),
    selected: channel(null),
    diameter: channel(defaultDiameter),
    defaultDiameter
  }
}

function selectCircle (circle, coll) {
  if (coll.selected.value === circle) return
  if (coll.selected.value) coll.selected.value.selected.send(false)
  coll.selected.send(circle)
  coll.diameter.send(circle.radius.value * 2)
  circle.selected.send(true)
}

function deselectCircle (coll) {
  coll.selected.send(null)
  coll.diameter.send(coll.defaultDiameter.value)
}

function toggleSelection (id, coll) {
  if (coll.selected.value && coll.selected.value.id === id) {
    deselectCircle(coll)
  } else {
    const circ = coll.circles.value.find(c => c.id === id)
    selectCircle(circ, coll)
  }
}

function createCircle ([x, y], coll) {
  const circle = Circle(x, y, coll.diameter.value / 2)
  // push the circle !
  const forward = () => {
    coll.circles.value.push(circle)
    selectCircle(circle, coll)
    coll.circles.send(coll.circles.value)
  }
  // pop the circle on undo
  const backward = () => {
    coll.circles.value.pop()
    coll.circles.send(coll.circles.value)
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
  const oldDiam = coll.diameter.value
  const newDiam = Number(event.currentTarget.value)
  const circle = coll.selected.value
  if (circle) {
    const forward = () => {
      coll.diameter.send(newDiam)
      circle.radius.send(newDiam / 2)
    }
    const backward = () => {
      coll.diameter.send(oldDiam)
      circle.radius.send(oldDiam / 2)
    }
    history.applyAction([forward, backward], coll.history)
  } else {
    coll.diameter.send(newDiam)
  }
}

function view (coll) {
  // svg and circle elements
  const g = html`<g stroke-width='1' stroke='black' fill='white'></g>`
  const circles = dom.childSync({
    view: circleView,
    container: g,
    channel: coll.circles
  })
  const svg = html`<svg onclick=${ev => createOrSelect(ev, coll)}> ${circles} </svg>`

  // inputs
  const slider = html`<input type='range' min=10 max=200 value=${coll.diameter.value} onchange=${ev => setDiameter(ev, coll)}>`
  coll.diameter.listen(d => { slider.value = d })
  const undoBtn = html`<button onclick=${() => history.undo(coll.history)}> Undo </button>`
  const redoBtn = html`<button onclick=${() => history.redo(coll.history)}> Redo </button>`
  coll.history.undoStack.listen(s => { undoBtn.disabled = !s.length })
  coll.history.redoStack.listen(s => { redoBtn.disabled = !s.length })

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
  const circElm = html`<circle cx=${circle.x} cy=${circle.y} r=${circle.radius.value} data-id=${circle.id}>`
  circle.selected.listen(selected => {
    circElm.setAttribute('fill', selected ? '#888' : 'white')
  })
  circle.radius.listen(r => { circElm.setAttribute('r', r) })
  return circElm
}

document.body.appendChild(view(CircleCollection()))
