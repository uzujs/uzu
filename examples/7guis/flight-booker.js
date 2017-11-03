const state = require('../../index')
const html = require('bel')

function Flight () {
  return state({
    way: 'one-way', // one-way | round-trip
    startErr: false,
    returnErr: false,
    booked: false
  })
}

const checkDateFormat = d => !(/\d\d\.\d\d\.\d\d\d\d/.test(d))

// set startErr or returnErr
const keyupDate = (flight, prop) => event => {
  const date = event.currentTarget.value
  flight.update({[prop]: checkDateFormat(date), booked: false})
}

const changeWay = flight => ev => flight.update({
  way: ev.currentTarget.value,
  booked: false
})

function view (flight) {
  // Inputs
  const startInput = dateInput(keyupDate(flight, 'startErr'), '12.12.2020')
  const returnInput = dateInput(keyupDate(flight, 'returnErr'), '')
  const bookBtn = html`<button onclick=${ev => flight.update({booked: true})}> Book </button>`

  // Dynamic elements
  const successMsg = html`<p>Booked!</p>`
  const gray = '#efefef'

  // Dynamic behavior
  flight.on('way', w => {
    returnInput.disabled = w === 'one-way'
    if (w === 'one-way') {
      returnInput.style.borderColor = gray
      flight.update({returnErr: false})
    } else {
      flight.update({returnErr: checkDateFormat(returnInput.value)})
    }
  })
  flight.on('startErr', err => {
    startInput.style.borderColor = err ? 'red' : gray
    bookBtn.disabled = err
  })
  flight.on('returnErr', err => {
    returnInput.style.borderColor = err ? 'red' : gray
    bookBtn.disabled = err
  })
  flight.on('booked', b => {
    successMsg.style.display = b ? 'block' : 'none'
  })

  return html`
    <div>
      <select onchange=${changeWay(flight)}>
        <option value='one-way'>One way</option>
        <option value='round-trip'>Round trip</option>
      </select>
      <br>
      ${startInput}
      <br>
      ${returnInput}
      <br>
      ${bookBtn}
      ${successMsg}
    </div>
  `
}

function dateInput (handler, val) {
  return html`<input type='text' onkeyup=${handler} placeholder='DD.MM.YYYY' value=${val}>`
}

document.body.appendChild(view(Flight()))
