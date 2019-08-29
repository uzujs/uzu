module.exports = statechart

function statechart (initial, actions) {
  var chart = {current: initial}

  // validateActions(initial, actions)

  function handleEvent (chart, event) {
    return function () {
      var args = arguments
      var cur = chart.current
      var handler
      for (var i = 0; i < actions[event].length; ++i) {
        var hand = actions[event][i]
        if (hand.sources.indexOf(cur) !== -1) {
          handler = hand
          break
        }
      }
      if (!handler) {
        throw new Error("Invalid action '" + event + "' from state '" + chart.current + "'")
      }
      chart.current = handler.dest
      if (typeof handler.action === 'function') {
        handler.action.apply(null, args)
      }
      return chart
    }
  }

  for (var event in actions) {
    if (event === 'current') {
      throw new Error('Invalid statechart event name "current".')
    }
    chart[event] = handleEvent(chart, event)
  }
  return chart
}
