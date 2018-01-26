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
  const counters = channel(initial.map(Counter))
  const total = channel(getTotal(counters.value))
  const aggregate = channel.aggregate(counters)
  aggregate.count.listen(function ([current, prev]) {
    total.send(total.value + (current - prev))
  })
  return {counters, total}
}

function append (list) {
  list.counters.send(list.counters.value.concat([Counter(0)]))
}

function getTotal (counters) {
  return counters.reduce(function (sum, counter) {
    return sum + counter.count.value
  }, 0)
}

function remove (id, list) {
  list.counters.send(list.counters.value.filter(c => c.id !== id))
  list.total.send(getTotal(list.counters.value))
}

function resetAll (list) {
  list.counters.value.forEach(function (counter) {
    counter.count.send(0)
  })
}

function listView (list) {
  const appendBtn = html`<button onmousedown=${() => append(list)}> Add bean bag </button>`
  const counterElems = dom.childSync({
    channel: list.counters,
    view: counterViewWithRemove(list)
  })
  const totalBeans = dom.text(list.total)
  const resetBtn = html`<button onclick=${() => resetAll(list)}> Reset all </button>`
  list.total.listen(function (total) {
    resetBtn.disabled = total === 0
  })

  return html`
    <div>
      <p> Bags of beans let's go </p>
      <p> Total beans ${totalBeans} </p>
      <p> ${resetBtn} </p>
      ${appendBtn}
      ${counterElems}
    </div>
  `
}

const counterViewWithRemove = list => counter => {
  const removeBtn = html`<button onmousedown=${() => remove(counter.id, list)}> Remove bag </button>`
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
  const spanCount = dom.text(counter.count)
  const countMsg = html`<p> Total beans: ${spanCount} </p>`

  const incrBtn = html`<button onmousedown=${() => increment(counter)}> add a bean </button`
  const decrBtn = html`<button onmousedown=${() => decrement(counter)}> toss a bean </button`
  const resetBtn = html`<button onmousedown=${() => reset(counter)}> throw all beans in the garbage </button`

  counter.count.listen(count => {
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
