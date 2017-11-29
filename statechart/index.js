const assert = require('assert')

function statechart (config) {
  const states = config.states
  const events = config.events
  const initial = config.initial || {}
  const where = config.where || {}
  assert(states && Array.isArray(states) && states.length, 'pass in a .states array')
  assert(events && typeof events === 'object', 'pass in a .events object')
  assert(initial && typeof initial === 'object', 'the optional .initial option must be an object where each key is a state name and each value is a bool')
  assert(where && typeof where === 'object', 'the optional .where option must be an object where each key is a state name and each value is another chart')

  const chart = {_statechart: true, state: initial}

  for (let name in where) {
    assert(where[name] && typeof where[name] === 'object', 'every .where value should be statechart')
    // Initialize nested statecharts inside of .where if they are plain objects
    if (!where[name]._statechart) {
      where[name] = statechart(where[name])
    }
  }

  // Create an object of states where each key is a state name for quick reference
  // If it is a simple state, the value will be null (will be true on stateObj.hasOwnProperty(stateName))
  // If it is a nested state with .where, then it will be set to that nested state obj
  const stateObj = {}
  states.forEach(stateName => {
    stateObj[stateName] = where[stateName] || null
  })

  // An object where every state name has a key
  // every value is an object of event names that can be fired in this state and every value is the state destination name
  const transitions = {}
  for (let name in events) {
    transitions[name] = {}
    // We want the format [[fromStateName, toStateName]], and it can also be [fromStatename, toStateName]
    let transitionArr = events[name]
    if (typeof transitionArr[0] === 'string') {
      transitionArr = [events[name]]
    }
    transitionArr.forEach(([fromState, toState]) => {
      transitions[name][fromState] = toState
    })
  }

  chart.event = function (eventName) {
    assert(typeof eventName === 'string', 'eventName should be a string')
    const nestedResult = nestedAction(eventName, 'event')
    if (nestedResult) return chart
    // Iterate current states
    var count = 0
    for (let name in chart.state) {
      if (chart.state[name] && transitions[eventName] && transitions[eventName][name]) {
        const dest = transitions[eventName][name]
        if (notHandlers[name]) notHandlers[name]()
        delete chart.state[name]
        chart.state[dest] = true
        count++
        if (where[dest]) {
          chart.state[dest] = where[dest].state
        }
        if (handlers[dest]) {
          handlers[dest]()
        }
      }
    }
    if (count === 0) throw new Error('Invalid event name + ' + eventName)
    return chart
  }

  const handlers = {}
  chart.when = function (stateName, cb) {
    handlers[stateName] = cb
    if (chart.state[stateName]) cb()
    return chart
  }
  const notHandlers = {}
  chart.whenNot = function (stateName, cb) {
    notHandlers[stateName] = cb
    if (!chart.state[stateName]) cb()
    return chart
  }

  // can be nested, eg. chart.hasState('foo.bar')
  chart.hasState = function (stateName) {
    const result = nestedAction(stateName, 'hasState')
    if (result !== undefined) return result
    return stateObj.hasOwnProperty(stateName)
  }

  // Does this chart, or any of its nested charts, have this event?
  chart.hasEvent = function (eventName) {
    const result = nestedAction(eventName, 'hasEvent')
    if (result !== undefined) return result
    return transitions.hasOwnProperty(eventName)
  }

  chart.hasTransition = function (eventName, fromState, toState) {
    return transitions[fromState]
      && transitions[fromState][eventName]
      && transitions[fromState][eventName][toState]
  }

  const nestedAction = (path, methodName) => {
    const crumbs = path.split('.')
    if (crumbs.length > 1) {
      const nestedChart = where[crumbs[0]]
      if (nestedChart) {
        return nestedChart[methodName](crumbs.slice(1).join('.'))
      }
    }
  }

  return chart
}

module.exports = statechart
