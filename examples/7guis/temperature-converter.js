const model = require('../../model')
const html = require('bel')

const toCelsius = f => Math.round((f - 32) * (5 / 9))
const toFahren = c => Math.round(c * 1.8 + 32)
const getVal = ev => ev.currentTarget.value

const Temps = (celsius, fahren) => model({ celsius, fahren })

function setCelsius (ev, temps) {
  temps.update({ fahren: toFahren(getVal(ev)) })
}

function setFahren (ev, temps) {
  temps.update({ celsius: toCelsius(getVal(ev)) })
}

function view () {
  const temps = Temps(0, 32)
  const celsInput = html`<input type='number' onkeyup=${(ev) => setCelsius(ev, temps)}>`
  const fahrenInput = html`<input type='number' onkeyup=${(ev) => setFahren(ev, temps)}>`
  temps.onUpdate('celsius', c => { celsInput.value = c })
  temps.onUpdate('fahren', f => { fahrenInput.value = f })

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
