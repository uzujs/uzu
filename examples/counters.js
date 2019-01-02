const Component = require('..')
const h = require('../h')

// A single counter that can be incremented and decremented
const Counter = function (start) {
  return Component({
    state: { count: start },
    events: {
      ADD: ({ state }, n) => ({ count: state.count + n })
    },
    view: ({ state, emitter }) => {
      return h('div', [
        h('p', ['Count is ', state.count]),
        h('button', { on: { click: () => emitter.emit('ADD', 1) } }, [ 'Increment' ]),
        h('button', { on: { click: () => emitter.emit('ADD', -1) } }, [ 'Decrement' ])
      ])
    }
  })
}

// A counter list that wraps
const CounterList = function () {
  return Component({
    state: { counters: [], total: 0, countStart: 1 },
    events: {
      ADD: ({ state }, n) => ({ total: state.total + n }),
      APPEND: ({ state, emitter }) => {
        const counter = Counter(state.countStart)
        const total = state.total + state.countStart
        counter.emitter.on('ADD', n => emitter.emit('ADD', n))
        const counters = state.counters.concat([ counter ])
        return { counters, total }
      },
      REMOVE: ({ state }, id) => {
        const counters = state.counters.filter(c => c.id !== id)
        const total = counters.reduce((sum, c) => sum + c.state.count, 0)
        return { counters, total }
      },
      SET_START: (_, start) => ({ countStart: start })
    },
    view: ({ state, emitter }) => {
      return h('div', [
        h('p', [ 'Total count is ', state.total ]),
        h('input', {
          on: { input: ev => emitter.emit('SET_START', Number(ev.currentTarget.value)) },
          props: {
            placeholder: 'Starting value',
            type: 'number',
            value: state.countStart
          }
        }),
        h('button', {
          on: { click: () => emitter.emit('APPEND') }
        }, 'Add counter'),
        h('div', state.counters.map(c => {
          return h('div', { key: c.id }, [
            c.vnode,
            h('button', {
              on: { click: () => emitter.emit('REMOVE', c.id) }
            }, 'Remove counter')
          ])
        }))
      ])
    }
  })
}

document.body.appendChild(CounterList().vnode.elm)
