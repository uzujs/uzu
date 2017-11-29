const html = require('bel')

// Nothing fancy here...
function view () {
  const countSpan = document.createElement('span')
  var count = 0
  const incr = () => {
    countSpan.textContent = count++
  }
  incr()
  const btn = html`<button onclick=${incr}> Count </button>`

  return html`
    <div>
      <p> Counter example </p>
      <p> ${countSpan} ${btn} </p>
    </div>
  `
}

document.body.appendChild(view())
