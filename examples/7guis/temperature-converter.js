const html = require('bel')

// Nothing fancy here...

const toCelsius = f => Math.round((f - 32) * (5 / 9))
const toFahren = c => Math.round(c * 1.8 + 32)
const getVal = ev => ev.currentTarget.value

function view () {
  var celsius = 0
  var fahren = 32 

  const keyupCelsius = ev => {
    fahrenInput.value = toFahren(getVal(ev))
  }
  const keyupFahren = ev => {
    celsiusInput.value = toCelsius(getVal(ev))
  }

  const celsiusInput = html`<input type='number' onkeyup=${keyupCelsius} value=${celsius}>`
  const fahrenInput = html`<input type='number' onkeyup=${keyupFahren} value=${fahren}>`

  return html`
    <div>
      <p> Fahrenheit-to-Celsius Temperature Converter </p>
      <div>
         ${celsiusInput} Celsius = ${fahrenInput} Fahrenheit
      </div>
    </div>
  `
}

document.body.appendChild(view())
