const model = require('../../model')
const html = require('bel')

function view () {
  const counter = model({count: 0})
  const incr = () => counter.update({count: counter.count + 1})
  const btn = html`<button onclick=${incr}> Count </button>`

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
