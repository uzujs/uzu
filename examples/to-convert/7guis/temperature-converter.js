const channel = require('../../channel')
const html = require('bel')

const toCelsius = f => Math.round((f - 32) * (5 / 9))
const toFahren = c => Math.round(c * 1.8 + 32)
const getVal = ev => ev.currentTarget.value

function view () {
  const cels = channel(0)
  const fahren = channel(32)
  const celsInput = html`<input type='number' onkeyup=${(ev) => fahren.send(toFahren(getVal(ev)))}>`
  const fahrenInput = html`<input type='number' onkeyup=${(ev) => cels.send(toCelsius(getVal(ev)))}>`
  cels.listen(c => { celsInput.value = c })
  fahren.listen(f => { fahrenInput.value = f })

  return html`
    <div>
      <p> TempConv </p>
      <div>
         ${celsInput} Celsius = ${fahrenInput} Fahrenheit
      </div>
    </div>
  `
}

document.body.appendChild(view())
