# uzu state machines

Statecharts are useful for managing complicated asynchronous UI. This is a small implementation of these statecharts, here called "machines", that can wrap several vanilla Uzu state objects.

This code is very much a work in progress and unfinalized

```js
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
    }
    noError: {
      $error: 'error',
      $book: 'booked'
    },
    booked: {
      $reset: 'notBooked'
    },
  },
  models: {flight: flight}
  effects: {
    roundTrip: {flight: {way: 'round-trip'}},
    oneWay: {flight: {way: 'one-way'}},
    booked: {flight: {booked: true}}
  }
})

bookerMachine.state // -> ['roundTrip', 'noError']
bookerMachine.flight.way // -> 'round-trip'
bookerMachine.transition('error')
bookerMachine.transition('book') // throws error
bookerMachine.state // -> ['roundTrip', 'error']
bookerMachine.transition('valid')
bookerMachine.transition('selectOneWay')
bookerMachine.state // -> ['oneWay', 'noError']
bookerMachine.transition('book') // no error thrown
bookerMachine.flight.booked // -> true
```

