// TODO 
// work through more real-world examples
// implement nested states
// implement state history

function machine (config) {
  const states = config.states
  const models = config.models || {}
  const effects = config.effects || {}
  if (!states) throw new TypeError('Pass in a .states property')
  if (!states.initial) throw new TypeError('Set an initial state')
  if (!Array.isArray(states.initial)) states.initial = [states.initial]
  const result = {states: states.initial}

  for (let name in models) {
    if (name === 'states') {
      throw new TypeError('None of your models can be called "states"')
    }
    result[name] = models[name]
  }

  const applyEffects = states => {
    states.forEach(stateName => {
      if (!effects[stateName]) return
      for (let modelName in effects[stateName]) {
        const updates = effects[stateName][modelName]
        models[modelName].update(updates)
      }
    })
  }

  result.transition = function (actionName) {
    var changed = []
    result.states = result.states.map((name, idx) => {
      const next = states[name]['$' + actionName]
      if (next) changed.push(next)
      return next || name
    })
    if (!changed.length) {
      throw new Error('Invalid state action: ' + actionName + '. Current states are: ' + result.states)
    }
    applyEffects(changed)
    return result
  }
  applyEffects(result.states)
  return result
}

module.exports = machine
