const {h, component} = require('../..')

// Component({
//   scope: ['timer'],
//   state: {elapsedMs: 0, duration: 1000, timeoutID: null, status: 'reset'},
//   on: {
//     toggle: () => {
//     },
//     reset: () => {
//     },
//     done: () => {
//     }
//   }
// })

function transition (event, status) {
  // A simple state machine for controlling the timer
  // State transitions
  const transitions = {
    TOGGLE: {
      running: 'paused',
      reset: 'running',
      paused: 'running',
      'finished': 'running'
    },
    RESET: {
      running: 'reset',
      finished: 'reset',
      paused: 'reset'
    },
    DONE: {
      running: 'finished'
    }
  }
  const newStatus = transitions[event][status]
  if (!newStatus) throw new Error('Invalid transition ' + event + ' from ' + status)
  return newStatus
}

function Timer () {
  return component({
    state: {elapsedMs: 0, duration: 10000, timeoutID: null, status: 'reset'},
    on: {
      TOGGLE: function (_, state, emit) {
        if (state.status === 'running') {
          console.log('status', state.status)
          clearTimeout(state.timeoutID)
          state.timeoutID = null
          state.status = transition('TOGGLE', state.status)
        } else {
          console.log('status', state.status)
          state.status = transition('TOGGLE', state.status)
          startTimer(state, emit)
        }
        emit('UPDATE', state)
      },
      SET_DURATION: function (ev, state, emit) {
        // Set the duration in MS from an input event
        state.duration = ev.currentTarget.value * 1000
        emit('UPDATE', state)
      },
      RESET: function (_, state, emit) {
        // Reset the timer completely, clear everything out
        clearTimeout(state.timeoutID)
        state.timeoutID = null
        state.elapsedMs = 0
        state.status = transition('RESET', state.status)
        emit('UPDATE', state)
      },
      DONE: function (_, state, emit) {
        clearTimeout(state.timeoutID)
        state.timeoutID = null
        state.status = transition('DONE', state.status)
        emit('UPDATE', state)
      }
    },
    view: view
  })
}

const startTimer = (state, emit) => {
  // prevent timeouts from stacking when clicking reset
  let target = Date.now()
  function tick () {
    if (state.elapsedMs >= state.duration) {
      emit('DONE')
      return
    }
    if (state.status === 'running') {
      var now = Date.now()
      target += 100
      state.timeoutID = setTimeout(tick, target - now)
      state.elapsedMs += 100
      emit('UPDATE', state)
    }
  }
  tick()
}

function view (state, emit) {
  const toggleBtnText = {
    running: 'Pause',
    paused: 'Start',
    reset: 'Start',
    finished: 'Start'
  }

  // Progress bar percentage width from elapsedMs and duration
  let barWidth = Math.round(state.elapsedMs * 100 / state.duration)
  barWidth = (barWidth <= 100) ? barWidth + '%' : '100%'

  return h('div', [
    h('div', [
      'Elapsed time: ',
      h('div.progress', {
        style: {width: '100px', height: '20px', background: 'grey'}
      }, [
        h('div.progress-bar', {
          style: {
            height: '20px',
            background: 'blue',
            width: barWidth
          }
        })
      ])
    ]),
    // Elapsed MS / Duration text
    h('div', [
      h('p', [
        (state.elapsedMs / 1000).toFixed(1) + 's',
        ' / ',
        (state.duration / 1000).toFixed(1) + 's'
      ])
    ]),
    // Duration input
    h('div', [
      'Duration: ',
      h('input', {
        props: {
          type: 'range',
          min: 1,
          max: 100,
          step: '0.1',
          value: 10
        },
        on: { input: ev => emit('SET_DURATION', ev) }
      })
    ]),
    // Start/Pause button
    h('div', [
      h('button', {
        on: {click: () => emit('TOGGLE')},
        props: {disabled: state.elapsedMs >= state.duration}
      }, [
        toggleBtnText[state.status]
      ])
    ]),
    // Reset button
    h('button', {
      on: { click: () => emit('RESET') },
      props: { disabled: state.status === 'reset' }
    }, [ 'Reset' ])
  ])
}

document.body.appendChild(Timer().node)
