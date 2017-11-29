const machine = require('./')
const model = require('../model')

const pedestrian = machine({
  initial: 'walk',
  states: {
    walk: {
      timer: 'wait'
    },
    wait: {
      timer: 'stop'
    },
    stop: { }
  }
})

const trafficLights = machine({
  initial: 'green',
  states: {
    green: {
      timer: 'yellow'
    },
    yellow: {
      timer: ['red', 'pedestrian.start']
    },
    red: {
      timer: 'green'
    },
  },
  children: {
    pedestrian: {
      machine: pedestrian
    }
  }
})

// Light interval
// Every 1.2s, switch the light
// If we are red, then switch 
setInterval(function (ts) {
  trafficLights.transition('timer')
  if (trafficLights.state.red) {
    setTimeout(function(ts) {
      trafficLights.pedestrian
    }, 400)
    setTimeout(function (ts) {
    }, 1000)
  }
}, 1200)

setInterval(function (ts) {
}, 400)

trafficLights.states // {green: true}
trafficLights.transition('timer')
trafficLights.states // {yellow: true}
trafficLights.transition('timer')
trafficLights.states // {red: true, pedestrian: pedestrian}
trafficLights.states.pedestrian.states // {walk: true}
trafficLights.states.pedestrian.transition('timer') // {walk: true}
trafficLights.states.pedestrian.states // {wait: true}
trafficLights.states.pedestrian.transition('timer')
trafficLights.states.pedestrian.states // {stop: true}
trafficLights.states.pedestrian.transition('reset')
trafficLights.states.pedestrian.states // {walk: true}
trafficLights.transition('timer')
trafficLights.states // {green: true}
