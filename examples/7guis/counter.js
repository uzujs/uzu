const {h, component, debug} = require('../..')

function Counter () {
  return component({
    state: 0,
    on: {
      INCR: (_, state, emit) => emit('UPDATE', state + 1)
    },
    view: function (state, emit) {
      return h('div', [
        h('p', 'Counter'),
        h('p', [state, h('button', {on: {click: () => emit('INCR')}}, 'Count')])
      ])
    }
  })
}

const counter = Counter()
debug(counter, 'counter')

document.body.appendChild(counter.node)
