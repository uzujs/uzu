const model = require('../../model')
const html = require('bel')

const Counter = (initial) => {
  return model({
    count: initial
  }, {
    increment: (_, m, update) => update({count: m.count + 1})
  })
}

function view () {
  const counter = Counter(0)
  const btn = html`<button onclick=${counter.events.increment}> Count </button>`

  const countSpan = document.createElement('span')
  counter.onUpdate('count', c => { countSpan.textContent = c })

  return html`
    <div>
      <p> Counter </p>
      <p> ${countSpan} ${btn} </p>
    </div>
  `
}

document.body.appendChild(view())
