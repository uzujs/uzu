const model = require('../../model')
const html = require('bel')
const statechart = require('../../statechart')

const fieldState = statechart({
  states: ['valid', 'invalid', 'disabled'],
  events: {
    OK: [['valid', 'valid'], ['invalid', 'valid'], ['disabled', 'valid']],
    ERR: [['valid', 'invalid'], ['invalid', 'invalid'], ['disabled', 'invalid']],
    DISABLE: [['invalid', 'disabled'], ['valid', 'disabled'], ['disabled', 'disabled']]
  },
  initial: {valid: true}
})

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
    startState: fieldState,
    returnState: fieldState.event('DISABLE')
  }, {
    setStartDate: (ev, m, update) => {
      const d = ev.currentTarget.value
      const isValid = validateDate(d)
      update({
        startDate: d,
        startState: m.startState.event(isValid ? 'OK' : 'ERR'),
        state: m.state.event(isValid ? 'OK' : 'ERR')
      })
    },
    setReturnDate: (ev, m, update) => {
      const d = ev.currentTarget.value
      const isValid = validateDate(d, m.startDate)
      const bothValid = m.startState.valid && m.returnState.valid
      update({
        returnDate: d,
        returnState: m.returnState.event(isValid ? 'OK' : 'ERR'),
        state: m.state.event(bothValid ? 'OK' : 'ERR')
      })
    },
    changeWay: (ev, m, update) => {
      update({way: ev.currentTarget.value})
      if (m.way === 'one-way') {
        update({
          returnState: m.returnState.event('DISABLE'),
          state: m.state.event(m.startState.valid ? 'OK' : 'ERR')
        })
      } else {
        const validReturn = validateDate(m.returnDate, m.startDate)
        const bothValid = validReturn && m.startState.valid
        update({
          returnState: m.returnState.event(validReturn ? 'OK' : 'ERR'),
          state: m.state.event(bothValid ? 'OK' : 'ERR')
        })
      }
    },
    book: (_, m, update) => update({ state: m.state.event('BOOK') }),
    unbook: (_, m, update) => update({ state: m.state.event('UNBOOK') })
  })
}

const validateDate = (d, after) => {
  after = after ? new Date(after) : new Date()
  const validFormat = /^\d\d\.\d\d\.\d\d\d\d$/.test(d)
  return validFormat && new Date(d) > after
}

function view (flight) {
  // Inputs
  const startInput = html`<input type='text' onkeyup=${flight.actions.setStartDate} placeholder='DD.MM.YYYY' value=${flight.startDate}>`
  const returnInput = html`<input type='text' onkeyup=${flight.actions.setReturnDate} placeholder='DD.MM.YYYY' value=${flight.returnDate}>`
  const bookBtn = html`<button onclick=${flight.actions.book}> Book </button>`
  const unbookBtn = html`<button onclick=${flight.actions.unbook}> Cancel booking </button>`
  const select = html`
    <select onchange=${flight.actions.changeWay}>
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
  flight.onUpdate('way', w => {
    successMsg.textContent = `Booked a ${w} flight departing on ${flight.startDate}`
    if (w === 'round-trip') {
      successMsg.textContent += ` and returning on ${flight.returnDate}`
    }
  })
  flight.onUpdate('returnState', s => {
    returnInput.disabled = s.disabled
    returnInput.classList.toggle('error', Boolean(s.invalid))
  })
  flight.onUpdate('startState', s => {
    startInput.classList.toggle('error', Boolean(s.invalid))
  })
  flight.onUpdate('state', s => {
    bookBtn.disabled = s.invalid
    fieldset.disabled = s.booked
    successDiv.hidden = !s.booked
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
