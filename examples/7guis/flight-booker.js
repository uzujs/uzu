const model = require('../../model')
const html = require('bel')
const statechart = require('../../machine')

// A simple statechart for a form field
function FormField () {
  return statechart({
    initial: {enabled: true, valid: true},
    invalid: {ERR: 'invalid', OK: 'valid'},
    valid: {ERR: 'invalid', OK: 'valid'},
    disabled: {ENABLE: 'enabled', DISABLE: 'disabled'},
    enabled: {ENABLE: 'enabled', DISABLE: 'disabled'}
  })
}

// A statechart controlling the booking and validity status for a flight
function FlightBooking () {
  return statechart({
    initial: {valid: true},
    invalid: { OK: 'valid', ERR: 'invalid' }, // cannot book
    valid: { OK: 'valid', ERR: 'invalid', BOOK: 'booked' },
    booked: { UNBOOK: 'valid' }
  })
}

function Flight () {
  return model({
    type: 'oneWay',
    startDate: '01.01.2020',
    returnDate: '02.02.2020',
    startField: FormField(),
    returnField: FormField().event('DISABLE'),
    booking: FlightBooking()
  })
}

const checkDateFormat = d => /^\d\d\.\d\d\.\d\d\d\d$/.test(d.trim())

// Set flight.startDateErr or flight.returnDatErr depending on whether they are valid
// to be valid they must match a format, be in the future, and the return date must be later
function validateFlight (flight) {
  const start = new Date(flight.startDate)
  const ret = new Date(flight.returnDate)
  const now = new Date()

  // Validate startDate
  if (!checkDateFormat(flight.startDate) || start < now) {
    flight.startField.event('ERR')
  } else flight.startField.event('OK')

  // Validate returnDate (it is always valid if the type is oneWay)
  if (flight.type === 'roundTrip' && (!checkDateFormat(flight.returnDate) || ret < start)) {
    flight.returnField.event('ERR')
  } else flight.returnField.event('OK')

  // The booking is invalid if the start date is invalid, or if it is roundTrip and the return date is invalid
  if (flight.startField.state.invalid || (flight.type === 'roundTrip' && flight.returnField.state.invalid)) {
    flight.booking.event('ERR') 
  } else flight.booking.event('OK')
}

// Set a date field
// fieldName is either 'startDate' or 'returnDate'
const setDate = (flight, ev, fieldName) => {
  flight.update({[fieldName]: ev.currentTarget.value})
  validateFlight(flight)
}

// Change the flight type (roundTrip or oneWay)
const changeWay = flight => ev => {
  const way = ev.currentTarget.value
  flight.update({type: way})
  if (way === 'oneWay') {
    flight.returnField.event('DISABLE')
  } else {
    flight.returnField.event('ENABLE')
  }
  validateFlight(flight)
}

function view () {
  const flight = Flight()
  // Event handlers
  const book = ev => flight.booking.event('BOOK')
  const unbook = ev => flight.booking.event('UNBOOK')
  const setOutDate = ev => setDate(flight, ev, 'startDate')
  const setRetDate = ev => setDate(flight, ev, 'returnDate')
  // Inputs
  const selector = html`
    <select onchange=${changeWay(flight)}>
      <option value='oneWay'>One way</option>
      <option value='roundTrip'>Round trip</option>
    </select>
  `
  const startInput = dateInput(setOutDate, flight.startDate, flight.startField)
  const returnInput = dateInput(setRetDate, flight.returnDate, flight.returnField)
  const bookBtn = html`<button onclick=${book}> Book </button>`
  const fieldset = html`<fieldset> ${selector} <br> ${startInput} <br> ${returnInput} <br> ${bookBtn} </fieldset>`

  // Dynamic elements
  const successMsg = html`<p></p>`
  const unbookBtn = html`<button onclick=${unbook}>Cancel booking</button>`

  flight.booking.when({
    booked: () => {
      unbookBtn.hidden = false
      fieldset.disabled = true
      if (flight.type === 'oneWay') {
        successMsg.textContent = 'Booked a one-way flight on ' + flight.startDate
      } else {
        successMsg.textContent = 'Booked a round-trip flight from ' + flight.startDate + ' to ' + flight.returnDate
      }
    },
    valid: () => {
      unbookBtn.hidden = true
      fieldset.disabled = false
      successMsg.textContent = ''
      bookBtn.disabled = false
    },
    invalid: () => {
      bookBtn.disabled = true
    }
  })

  return html`
    <div>
      <style>
        .error {
          background: red;
        }
      </style>
      ${fieldset}
      ${successMsg}
      <br> ${unbookBtn}
    </div>
  `
}

function dateInput (keyupHandler, val, fieldChart) {
  const inp = html`<input type='text' onkeyup=${keyupHandler} placeholder='DD.MM.YYYY' value=${val}>`
  fieldChart.when({
    invalid: () => { inp.classList.add('error') },
    valid: () => { inp.classList.remove('error') },
    disabled: () => { inp.disabled = true },
    enabled: () => { inp.disabled = false }
  })
  return inp
}

const gray = '#efefef'

document.body.appendChild(view())
