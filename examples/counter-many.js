const dom = require('../dom')
const html = require('bel')
const model = require('../model')

var id = 0
function Counter (initial) {
  return model({count: initial, id: id++}, {
    increment: (ev, m, update) => update({ count: m.count + 1 }),
    decrement: (ev, m, update) => update({ count: m.count - 1 }),
    reset: (ev, m, update) => update({ count: 0 })
  })
}

function CounterList (initial = []) {
  return model({counters: initial.map(Counter)}, {
    append: (ev, m, update) => update({
      counters: m.counters.concat([Counter(0)])
    }),
    remove: (id, m, update) => update({
      counters: m.counters.filter(c => c.id !== id)
    })
  })
}

function listView (counterList) {
  const appendBtn = html`<button onclick=${counterList.events.append}> Add bean bag </button>`
  const counterElems = dom.childSync({
    model: counterList,
    prop: 'counters',
    container: 'div',
    view: counterViewWithRemove(counterList)
  })

  return html`
    <div>
      <p> Bags of beans let's go </p>
      ${appendBtn}
      ${counterElems}
    </div>
  `
}

const counterViewWithRemove = counterList => counter => {
  const removeFn = ev => counterList.events.remove(counter.id)
  const removeBtn = html`<button onclick=${removeFn}> Remove bag </button>`
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
  const btn = (name, text) => html`<button onclick=${counter.events[name]}> ${text} </button>`

  const spanCount = document.createElement('span')
  counter.onUpdate('count', c => { spanCount.textContent = c })
  const countMsg = html`<p> Total beans: ${spanCount} </p>`

  const incrBtn = btn('increment', 'add bean')
  const decrBtn = btn('decrement', 'toss a bean')
  const resetBtn = btn('reset', 'throw all beans in the garbage')

  counter.onUpdate('count', function () {
    decrBtn.disabled = resetBtn.disabled = counter.count === 0
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
