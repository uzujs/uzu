const test = require('tape')
const machine = require('../../machine')
const state = require('../../')

function Flight () {
  return state({
    way: 'one-way', // one-way | round-trip
    startErr: false,
    returnErr: false,
    booked: false
  })
}

const flight = Flight()
const bookerMachine = machine({
  states: {
    initial: ['roundTrip', 'noError'],
    roundTrip: {
      $selectOneWay: 'oneWay'
    },
    oneWay: {
      $selectRoundTrip: 'roundTrip'
    },
    error: {
      $valid: 'noError'
    },
    noError: {
      $error: 'error',
      $book: 'booked'
    },
    booked: {
      $reset: 'notBooked'
    }
  },
  models: {flight: flight},
  effects: {
    roundTrip: {flight: {way: 'round-trip'}},
    oneWay: {flight: {way: 'one-way'}},
    booked: {flight: {booked: true}}
  }
})

test('sets initial states and effects', t => {
  t.deepEqual(bookerMachine.states, ['roundTrip', 'noError'])
  t.strictEqual(bookerMachine.flight.way, 'round-trip')
  t.end()
})

test('throws error on inaccessible action', t => {
  bookerMachine.transition('error')
  t.deepEqual(bookerMachine.states, ['roundTrip', 'error'])
  t.throws(() => bookerMachine.transition('book'))
  t.end()
})

test('it transitions and sets effects', t => {
  bookerMachine.transition('valid')
  bookerMachine.transition('selectOneWay')
  t.deepEqual(bookerMachine.states, ['oneWay', 'noError'])
  bookerMachine.transition('book') // no error thrown
  t.assert(bookerMachine.flight.booked)
  t.end()
})
