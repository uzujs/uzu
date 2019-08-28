// Multiple countdown timer example
// Run locally with `budo --live --open examples/timer.js`
const { stateful, h } = require('..')
const statechart = require('../statechart')

// A countdown timer component with a state machine
function Timer (start) {
  const state = statechart('initial', {
    reset: [{
      sources: ['running', 'finished', 'paused'],
      dest: 'initial',
      action: (timer) => {
        if (timer._store.interval) {
          clearInterval(timer._store.interval)
        }
        timer._store.ms = timer._store.start
        timer._render()
      }
    }],
    toggle: [
      // start
      {
        sources: ['initial', 'paused'],
        dest: 'running',
        action: (timer) => {
          timer._store.interval = setInterval(() => {
            if (timer._store.ms <= 0) {
              // We ran out of time. Trigger the finish action
              clearInterval(timer._store.interval)
              timer._store.ms = 0
              timer._store.state = state.finish(timer)
            } else {
              // Continue counting down
              timer._store.ms -= 100
            }
            timer._render()
          }, 100)
        }
      },
      // pause
      {
        sources: ['running'],
        dest: 'paused',
        action: (timer) => {
          clearInterval(timer._store.interval)
          timer._store.interval = null
          timer._render()
        }
      }
    ],
    finish: [{
      sources: ['running'],
      dest: 'finished',
      action: (timer) => {
        timer._render()
      }
    }]
  })

  return stateful({
    state,
    interval: null, // setInterval reference
    start, // start time in ms
    ms: start // elapsed time in ms
  }, view)
}

function view (timer) {
  const st = timer._store
  console.log('state', st.state)
  return h('div', [
    h('p', [
      Math.ceil(st.ms / 1000),
      ' seconds left'
    ]),
    h('button', {
      props: { disabled: st.state.current === 'initial' },
      on: { click: () => st.state.reset(timer) }
    }, 'Reset'),
    h('button', {
      props: { disabled: st.state.current === 'finished' },
      on: { click: () => st.state.toggle(timer) }
    }, st.state.current === 'running' ? 'Pause' : 'Start')
  ])
}

// Append a new timer component to the TimerList's list
// Wrap each timer in an object with an id
function appendTimer (list) {
  const timer = Timer(5000)
  const _id = String(Math.random() * 100000)
  list._store.timers.push({ id: _id, cmp: timer })
  list._render()
}

// Remove a timer from the TimerList by ID
function removeTimer (list, _id) {
  list._store.timers = list._store.timers.filter(t => t.id !== _id)
  list._render()
}

// The TimerList is a demonstration of the modularity and scalability of uzu.
// Components can be dynamically instantiated, removed, nested, and aggregated
// Global controls can manipulate *all* child timers
function TimerList () {
  return stateful({
    timers: []
  }, (list) => {
    return h('div', [
      h('button', {
        on: { click: () => appendTimer(list) }
      }, 'Add timer'),
      h('div', list._store.timers.map(timer => {
        return h('div', {
          // It's important for snabbdom to use a key here, when repeating dynamic components like this
          key: timer.id
        }, [
          h('hr'),
          h('button', { on: { click: () => removeTimer(list, timer.id) } }, 'Remove timer'),
          timer.cmp
        ])
      }))
    ])
  })
}

const list = TimerList()
document.body.appendChild(list.elm)
