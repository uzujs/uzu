const dom = require('../dom')
const html = require('bel')
const channel = require('../channel')

var id = 0
function Counter (initial) {
  return {count: channel(initial), id: id++}
}

function increment (counter) {
  counter.count.send(counter.count.value + 1)
}

function decrement (counter) {
  counter.count.send(counter.count.value - 1)
}

function reset (counter) {
  counter.count.send(0)
}

function CounterList (initial = []) {
  return {counters: channel(initial.map(Counter))}
}

function append (list) {
  list.counters.send(list.counters.value.concat([Counter(0)]))
}

function remove (id, list) {
  list.counters.send(list.counters.value.filter(c => c.id !== id))
}

function listView (list) {
  const appendBtn = html`<button onclick=${() => append(list)}> Add bean bag </button>`
  const counterElems = dom.childSync({
    channel: list.counters,
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

  counter.count.listen(count => {
    spanCount.textContent = count
    decrBtn.disabled = resetBtn.disabled = count === 0
  })

  return html`
    <div>
      <p> Bean bag #${counter.id} </p>
      ${incrBtn}
      ${decrBtn}
      ${resetBtn}
      ${countMsg}
    </div>
  `
}

document.body.appendChild(listView(CounterList([0, 1, 2])))
