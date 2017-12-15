var channel = require('../channel')

module.exports = function Statechart (config) {
  // An object of {sourceState: {EVENT_NAME: destinationState}}
  var transByState = config.states.reduce(function (obj, name) {
    obj[name] = {}
    return obj
  }, {})

  for (var eventName in config.events) {
    var pairs = config.events[eventName]
    if (typeof pairs[0] === 'string') pairs = [pairs]
    pairs.forEach(p => {
      var source = p[0]
      var dest = p[1]
      if (!transByState[source]) throw new Error('Invalid transition from: ' + source)
      if (!transByState[dest]) throw new Error('Invalid transition to: ' + dest)
      if (transByState[source][eventName]) throw new Error('Ambiguous state transition event "' + eventName + '" from state "' + source + '"')
      transByState[source][eventName] = dest
      transByState[source]._accessible = true
      transByState[dest]._accessible = true
    })
  }

  // Check for inaccessible states
  for (var stateName in transByState) {
    if (!transByState[stateName]._accessible) {
      throw new Error('Inaccessible state "' + stateName + '"')
    }
  }

  function getNextState (state, eventName) {
    var newState = {}
    var transitionCount = 0
    for (var stateName in state) {
      if (state[stateName]) {
        var dest = transByState[stateName] && transByState[stateName][eventName]
        if (dest) {
          newState[dest] = true
          transitionCount++
        } else {
          newState[stateName] = state[stateName]
        }
      }
    }
    if (transitionCount === 0) {
      throw new Error('Invalid event "' + eventName + '" from state "' + JSON.stringify(state) + '"')
    }
    return newState
  }

  var state = channel(config.initial || {})
  state.event = function (name) {
    state.send(getNextState(state.value, name))
    return state
  }
  return state
}
