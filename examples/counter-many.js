const dom = require('../dom')
const html = require('bel')
const model = require('../model')

var id = 0
function Counter (initial) {
  return model({count: initial, id: id++})
}

function increment (counter) {
  counter.update({count: counter.count + 1})
}

function decrement (counter) {
  counter.update({count: counter.count - 1})
}

function reset (counter) {
  counter.update({count: 0})
}

function CounterList (initial = []) {
  return model({counters: initial.map(Counter)})
}

function append (list) {
  list.update({
    counters: list.counters.concat([Counter(0)])
  })
}

function remove (id, list) {
  list.update({
    counters: list.counters.filter(c => c.id !== id)
  })
}

function listView (list) {
  const appendBtn = html`<button onclick=${() => append(list)}> Add bean bag </button>`
  const counterElems = dom.childSync({
    model: list,
    key: 'counters',
    view: counterViewWithRemove(list)
  })

  return html`
    <div>
      <p> Bags of beans let's go </p>
      ${appendBtn}
      ${counterElems}
    </div>
  `
}

const counterViewWithRemove = list => counter => {
  const removeBtn = html`<button onclick=${() => remove(counter.id, list)}> Remove bag </button>`
  return html`
    <div>
      <hr>
      <input type='checkbox'>
      ${counterView(counter)}
      ${removeBtn}
    </div>
  `
}

function counterView (counter) {
  const spanCount = document.createElement('span')
  const countMsg = html`<p> Total beans: ${spanCount} </p>`

  const incrBtn = html`<button onclick=${() => increment(counter)}> add a bean </button`
  const decrBtn = html`<button onclick=${() => decrement(counter)}> toss a bean </button`
  const resetBtn = html`<button onclick=${() => reset(counter)}> throw all beans in the garbage </button`

  counter.onUpdate('count', function (count) {
    spanCount.textContent = count
    decrBtn.disabled = resetBtn.disabled = count === 0
  })

  const spanID = document.createElement('span')
  counter.onUpdate('id', id => { spanID.textContent = id })

  return html`
    <div>
      <p> Bean bag #${spanID} </p>
      ${incrBtn}
      ${decrBtn}
      ${resetBtn}
      ${countMsg}
    </div>
  `
}

document.body.appendChild(listView(CounterList([0, 1, 2])))
