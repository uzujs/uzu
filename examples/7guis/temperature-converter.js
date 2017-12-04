const model = require('../../model')
const html = require('bel')

const toCelsius = f => Math.round((f - 32) * (5 / 9))
const toFahren = c => Math.round(c * 1.8 + 32)
const getVal = ev => ev.currentTarget.value

const Temps = (cels, fahren) => model({
  celsius: cels,
  fahren: fahren
}, {
  setCelsius: (ev, m, update) => update({ fahren: toFahren(getVal(ev)) }),
  setFahren: (ev, m, update) => update({ celsius: toCelsius(getVal(ev)) })
})

function view () {
  const temps = Temps(0, 32)
  const celsInput = html`<input type='number' onkeyup=${temps.actions.setCelsius}>`
  const fahrenInput = html`<input type='number' onkeyup=${temps.actions.setFahren}>`
  temps.onUpdate('celsius', c => { celsInput.value = c })
  temps.onUpdate('fahren', f => { fahrenInput.value = f })

  return html`
    <div>
      <p> TempConv </p>
      <div>
         ${celsInput}
         Celsius
         =
         ${fahrenInput}
         Fahrenheit
      </div>
    </div>
  `
}

document.body.appendChild(view())
