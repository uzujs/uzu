const {h, component, debug} = require('../..')

function Booker () {
  return component({
    state: {
      booked: false,
      way: 'one-way',
      startDate: '01.01.2020',
      returnDate: '02.02.2020',
      startValid: true,
      returnValid: true,
      valid: true
    },
    on: {
      CHANGE_WAY: function (ev, state, emit) {
        if (state.booked) throw new Error('Cannot set way on a booked trip')
        state.way = ev.currentTarget.value
        state.valid = isValidBooking(state)
        emit('UPDATE', state)
      },
      SET_START: function (ev, state, emit) {
        if (state.booked) throw new Error('Cannot set dates on a booked trip')
        state.startDate = ev.currentTarget.value
        const today = new Date()
        state.startValid = isValidDate(state.startDate) && isAfterDate(state.startDate, today)
        state.valid = isValidBooking(state)
        emit('UPDATE', state)
      },
      SET_RETURN: function (ev, state, emit) {
        if (state.way === 'one-way') throw new Error('Cannot set return date for a one-way trip')
        if (state.booked) throw new Error('Cannot set dates on a booked trip')
        state.returnDate = ev.currentTarget.value
        // The return date is valid if:
        //   its format is valid AND
        //     the start date is invalid OR the start date is before the return date
        state.returnValid = isValidDate(state.returnDate) &&
          (!state.startValid || isAfterDate(state.returnDate, state.startDate))
        state.valid = isValidBooking(state)
        emit('UPDATE', state)
      },
      BOOK: function (_, state, emit) {
        if (state.booked) throw new Error('Must be unbooked to book')
        if (!state.valid) throw new Error('Cannot book when invalid')
        state.booked = true
        emit('UPDATE', state)
      },
      UNBOOK: function (_, state, emit) {
        if (!state.booked) throw new Error('Must be booked to unbook')
        state.booked = false
        emit('UPDATE', state)
      }
    },
    view: view
  })
}

function isValidBooking (state) {
  // Is the flight booking valid, given their selected way (one-way/round-trip)?
  // There may be a return date error, but the flight is valid if they chose one-way
  if (state.way === 'one-way') {
    return state.startValid
  } else {
    return state.startValid && state.returnValid
  }
}

function isValidDate (str) {
  // Check that both dates have valid formats and that beforeDate is before afterDate
  return /^\d\d\.\d\d\.\d\d\d\d$/.test(str)
}

function isAfterDate (afterDate, beforeDate) {
  if (typeof beforeDate === 'string') {
    beforeDate = new Date(beforeDate)
  }
  if (typeof afterDate === 'string') {
    afterDate = new Date(afterDate)
  }
  return afterDate > beforeDate
}

function view (state, emit) {
  // Dynamic behavior
  let successMsg = ''
  if (state.booked) {
    successMsg = `Booked a ${state.way} flight departing on ${state.startDate}`
    if (state.way === 'round-trip') {
      successMsg += ` and returning on ${state.returnDate}`
    }
  }
  return h('div', [
    h('style', {props: {innerHTML: '.error {background: red;} .hide {display: none;}'}}),
    h('fieldset', {
      props: {disabled: state.booked}
    }, [
      h('select', {
        on: {change: ev => emit('CHANGE_WAY', ev)}
      }, [
        h('option', {props: {value: 'one-way'}}, 'One way'),
        h('option', {props: {value: 'round-trip'}}, 'Round trip')
      ]),
      h('br'),
      h('input', {
        class: {error: !state.startValid},
        props: {type: 'text', placeholder: 'DD.MM.YYYY', value: state.startDate},
        on: {input: ev => emit('SET_START', ev)}
      }),
      h('br'),
      h('input', {
        class: {error: state.way === 'round-trip' && !state.returnValid},
        props: {
          type: 'text',
          placeholder: 'DD.MM.YYYY',
          value: state.returnDate,
          disabled: state.way === 'one-way'
        },
        on: {input: ev => emit('SET_RETURN', ev)}
      }),
      h('br'),
      h('button', {
        on: {click: () => emit('BOOK')},
        props: {disabled: !state.valid}
      }, 'Book')
    ]),
    h('div', {
      display: {hide: !state.booked}
    }, [
      h('p', successMsg),
      h('button', {
        on: {click: () => emit('UNBOOK')},
        class: {hide: !state.booked}
      }, 'Cancel booking')
    ])
  ])
}

const booker = Booker()
debug(booker, 'booker')

document.body.appendChild(booker.node)
