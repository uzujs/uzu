const model = require('../../model')
const html = require('bel')
const statechart = require('../../statechart')

const flightState = statechart({
  states: ['booked', 'valid', 'invalid'],
  events: {
    BOOK: ['valid', 'booked'],
    UNBOOK: ['booked', 'valid'],
    ERR: [['valid', 'invalid'], ['invalid', 'invalid']],
    OK: [['invalid', 'valid'], ['valid', 'valid']]
  },
  initial: {valid: true}
})

function Flight () {
  return model({
    way: 'one-way', // one-way | round-trip
    state: flightState,
    startDate: '01.01.2020',
    returnDate: '02.02.2020',
    startErr: false,
    returnErr: false
  })
}

function setStartDate (ev, flight) {
  const d = ev.currentTarget.value
  const isValid = validateDate(d)
  flight.update({
    startDate: d,
    startErr: !isValid,
    state: flight.state.event(isValid ? 'OK' : 'ERR')
  })
}

function setReturnDate (ev, flight) {
  const d = ev.currentTarget.value
  const isValid = validateDate(d, flight.startDate)
  const bothValid = !flight.startErr && isValid
  flight.update({
    returnDate: d,
    returnErr: !isValid,
    state: flight.state.event(bothValid ? 'OK' : 'ERR')
  })
}

function changeWay (ev, flight) {
  flight.update({way: ev.currentTarget.value})
  if (flight.way === 'one-way') {
    flight.update({
      state: flight.state.event(flight.startErr ? 'ERR' : 'OK')
    })
  } else {
    const bothValid = !flight.startErr && !flight.returnErr
    flight.update({
      state: flight.state.event(bothValid ? 'OK' : 'ERR')
    })
  }
}

function book (flight) {
  flight.update({state: flight.state.event('BOOK')})
}
function unbook (flight) {
  flight.update({state: flight.state.event('UNBOOK')})
}

const validateDate = (d, after) => {
  after = after ? new Date(after) : new Date()
  const validFormat = /^\d\d\.\d\d\.\d\d\d\d$/.test(d)
  return validFormat && new Date(d) > after
}

function view (flight) {
  // Inputs
  const startInput = html`<input type='text' onkeyup=${ev => setStartDate(ev, flight)} placeholder='DD.MM.YYYY' value=${flight.startDate}>`
  const returnInput = html`<input type='text' onkeyup=${ev => setReturnDate(ev, flight)} placeholder='DD.MM.YYYY' value=${flight.returnDate}>`
  const bookBtn = html`<button onclick=${() => book(flight)}> Book </button>`
  const unbookBtn = html`<button onclick=${() => unbook(flight)}> Cancel booking </button>`
  const select = html`
    <select onchange=${ev => changeWay(ev, flight)}>
      <option value='one-way'>One way</option>
      <option value='round-trip'>Round trip</option>
    </select>
  `

  // Dynamic elements
  const successMsg = html`<p></p>`
  const successDiv = html`<div> ${successMsg} ${unbookBtn} </div>`
  const fieldset = html`
    <fieldset>
      ${select} <br> ${startInput} <br> ${returnInput} <br> ${bookBtn}
    </fieldset>
  `

  // Dynamic behavior
  flight.onUpdate('way', way => {
    successMsg.textContent = `Booked a ${way} flight departing on ${flight.startDate}`
    returnInput.classList.toggle('error', Boolean(flight.returnErr))
    if (way === 'round-trip') {
      successMsg.textContent += ` and returning on ${flight.returnDate}`
    } else {
      returnInput.classList.remove('error')
    }
    returnInput.disabled = way === 'one-way'
  })
  flight.onUpdate('startErr', hasErr => {
    startInput.classList.toggle('error', Boolean(hasErr))
  })
  flight.onUpdate('returnErr', hasErr => {
    returnInput.classList.toggle('error', Boolean(hasErr))
  })
  flight.onUpdate('state', state => {
    bookBtn.disabled = state.invalid
    fieldset.disabled = state.booked
    successDiv.hidden = !state.booked
  })

  return html`
    <div>
      <style> .error { background: red; } </style>
      ${fieldset}
      ${successDiv}
    </div>
  `
}

document.body.appendChild(view(Flight()))
