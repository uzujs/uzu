const state = require('../../index')
const html = require('bel')

const toCelsius = f => Math.round((f - 32) * (5 / 9))
const toFahren = c => Math.round(c * 1.8 + 32)
const getVal = ev => ev.currentTarget.value

function view () {
  const celsius = state({val: 0})
  const fahren = state({val: 32})
  const handleCelsiusKeyup = ev => fahren.update({val: toFahren(getVal(ev))})
  const handleFahrenKeyup = ev => celsius.update({val: toCelsius(getVal(ev))})

  return html`
    <div>
      <p> TempConv </p>
      <div>
         ${input(handleCelsiusKeyup, celsius)}
         Celsius
         =
         ${input(handleFahrenKeyup, fahren)}
         Fahrenheit
      </div>
    </div>
  `
}

function input (handler, state) {
  const elm = html`<input type='number' onkeyup=${handler}>`
  state.on('val', v => { elm.value = v })
  return elm
}

document.body.appendChild(view())
