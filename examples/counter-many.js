const dom = require('../dom')
const html = require('bel')
const state = require('../index')

var uid = 0
function Counter (initial, id) {
  return state({count: initial, id: uid++})
}

var counterActions = {
  increment: function (c) {
    c.update({count: c.count + 1})
  },
  decrement: function (c) {
    if (c.count > 0) {
      c.update({count: c.count - 1})
    }
  },
  reset: function (c) {
    c.update({count: 0})
  }
}

function CounterList (initial = []) {
  return state({counters: initial.map(Counter)})
}

var counterListActions = {
  append: function (initial, c) {
    c.update({counters: c.counters.concat([Counter(initial)])})
  },
  remove: function (id, c) {
    const filtered = c.counters.filter(c => c.id !== id)
    c.update({counters: filtered})
  }
}

function listView (counterList) {
  const appendFn = ev => counterListActions.append(0, counterList)
  const appendBtn = html`<button onclick=${appendFn}> Add bean bag </button>`
  const counterElems = dom.childSync({
    state: counterList,
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
  const removeFn = ev => counterListActions.remove(counter.id, counterList)
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
  const action = name => ev => counterActions[name](counter)
  const btn = (name, text) => html`<button onclick=${action(name)}> ${text} </button>`

  const spanCount = document.createElement('span')
  counter.on('count', c => { spanCount.textContent = c })
  const countMsg = html`<p> Total beans: ${spanCount} </p>`

  const incrBtn = btn('increment', 'add bean')
  const decrBtn = btn('decrement', 'toss a bean')
  const resetBtn = btn('reset', 'throw all beans in the garbage')

  counter.on('count', function () {
    decrBtn.disabled = resetBtn.disabled = counter.count === 0
  })

  const spanID = document.createElement('span')
  counter.on('id', id => { spanID.textContent = id })

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
