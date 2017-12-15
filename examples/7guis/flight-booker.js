const channel = require('../../channel')
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
  return {
    way: channel('one-way'), // one-way | round-trip
    state: channel(flightState),
    startDate: channel('01.01.2020'),
    returnDate: channel('02.02.2020'),
    startErr: channel(false),
    returnErr: channel(false)
  }
}

function setStartDate (ev, flight) {
  const d = ev.currentTarget.value
  const isValid = validateDate(d)
  flight.startDate.send(d)
  flight.startErr.send(!isValid)
  flight.state.send(flight.state.value.event(isValid ? 'OK' : 'ERR'))
}

function setReturnDate (ev, flight) {
  const d = ev.currentTarget.value
  const isValid = validateDate(d, flight.startDate.value)
  const bothValid = !flight.startErr.value && isValid
  flight.returnDate.send(d)
  flight.returnErr.send(!isValid)
  flight.state.send(flight.state.value.event(bothValid ? 'OK' : 'ERR'))
}

function changeWay (ev, flight) {
  flight.way.send(ev.currentTarget.value)
  if (flight.way === 'one-way') {
    flight.state.send(flight.state.value.event(flight.startErr ? 'ERR' : 'OK'))
  } else {
    const bothValid = !flight.startErr.value && !flight.returnErr.value
    flight.state.send(flight.state.value.event(bothValid ? 'OK' : 'ERR'))
  }
}

function book (flight) {
  flight.state.send(flight.state.value.event('BOOK'))
}
function unbook (flight) {
  flight.state.send(flight.state.value.event('UNBOOK'))
}

const validateDate = (d, after) => {
  const validFormat = d => /^\d\d\.\d\d\.\d\d\d\d$/.test(d)
  after = after && validFormat(after) ? new Date(after) : new Date()
  return validFormat(d) && new Date(d) > after
}

function view (flight) {
  // Inputs
  const startInput = html`<input type='text' oninput=${ev => setStartDate(ev, flight)} placeholder='DD.MM.YYYY' value=${flight.startDate.value}>`
  const returnInput = html`<input type='text' oninput=${ev => setReturnDate(ev, flight)} placeholder='DD.MM.YYYY' value=${flight.returnDate.value}>`
  const bookBtn = html`<button onclick=${() => book(flight)}> Book </button>`
  const unbookBtn = html`<button onclick=${() => unbook(flight)}> cancel booking </button>`
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
  flight.way.listen(way => {
    successMsg.textContent = `Booked a ${way} flight departing on ${flight.startDate.value}`
    returnInput.classList.toggle('error', Boolean(flight.returnErr.value))
    if (way === 'round-trip') {
      successMsg.textContent += ` and returning on ${flight.returnDate.value}`
    } else {
      returnInput.classList.remove('error')
    }
    returnInput.disabled = way === 'one-way'
  })
  flight.startErr.listen(hasErr => {
    startInput.classList.toggle('error', Boolean(hasErr))
  })
  flight.returnErr.listen(hasErr => {
    returnInput.classList.toggle('error', Boolean(hasErr))
  })
  flight.state.listen(state => {
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
