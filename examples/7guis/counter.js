const channel = require('../../channel')
const html = require('bel')

function view () {
  const sum = channel(0)
  const incr = () => sum.send(sum.value + 1)
  const btn = html`<button onclick=${incr}> Count </button>`

  const countSpan = document.createElement('span')
  sum.listen(n => { countSpan.textContent = n })

  return html`
    <div>
      <p> Counter </p>
      <p> ${countSpan} ${btn} </p>
    </div>
  `
}

document.body.appendChild(view())
