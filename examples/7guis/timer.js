const model = require('../../model')
const statechart = require('../../statechart')
const html = require('bel')

const state = statechart({
  states: ['running', 'paused', 'reset', 'finished'],
  events: {
    PAUSE: ['running', 'paused'],
    RESET: [['running', 'reset'], ['finished', 'reset'], ['paused', 'reset']],
    START: [['paused', 'running'], ['reset', 'running']],
    DONE: ['running', 'finished']
  },
  initial: {reset: true}
})

function Timer () {
  return model({
    elapsedMs: 0,
    duration: 10000,
    timeoutID: null,
    state: state
  }, {
    // Toggle start or pause
    toggle: (ev, timer, update) => {
      if (timer.state.running) {
        // Pause
        clearTimeout(timer.timeoutID)
        update({
          timeoutID: null,
          state: timer.state.event('PAUSE')
        })
      } else {
        startTimer(timer, update)
      }
    },
    reset: (ev, timer, update) => {
      clearTimeout(timer.timeoutID)
      update({
        timeoutID: null,
        elapsedMs: 0,
        state: timer.state.event('RESET')
      })
    },
    setDuration: (ev, timer, update) => {
      update({duration: ev.currentTarget.value * 1000})
    }
  })
}

const startTimer = (timer, update) => {
  // prevent timeouts from stacking when clicking reset
  update({ state: timer.state.event('START') })
  let target = Date.now()
  function tick () {
    if (!timer.state.running) return
    if (timer.elapsedMs >= timer.duration) {
      return update({ state: timer.state.event('DONE') })
    }
    var now = Date.now()
    target += 100
    const timeoutID = setTimeout(tick, target - now)
    update({
      elapsedMs: timer.elapsedMs + 100,
      timeoutID: timeoutID
    })
  }
  tick()
}

function view (timer) {
  // inputs
  const slider = html`<input type='range' min=0 max=100 step="0.1" oninput=${timer.actions.setDuration} value=10>`
  const startPauseBtn = html`<button onclick=${timer.actions.toggle}> </button>`
  const resetBtn = html`<button onclick=${timer.actions.reset}> Reset </button>`
  // dynamic outputs
  const progress = html`<div class='progress'><div class='progress-bar'></div></div>`
  const secondsSpan = html`<span>0.0s</span>`

  timer.onUpdate('state', s => {
    startPauseBtn.textContent = s.paused || s.reset ? 'Start' : 'Pause'
    startPauseBtn.disabled = s.finished
    resetBtn.disabled = s.reset
  })
  timer.onUpdate('elapsedMs', ms => {
    secondsSpan.textContent = (ms / 1000).toFixed(1) + 's'
    const perc = Math.round(timer.elapsedMs * 100 / timer.duration)
    if (perc <= 100) {
      progress.firstChild.style.width = perc + '%'
    }
  })

  return html`
    <div>
      <style>
        .progress {
          width: 100px;
          height: 20px;
          background: grey;
        }
        .progress-bar {
          height: 20px;
          background: blue;
        }
      </style>
      <div> Elapsed time: ${progress} </div>
      <div> ${secondsSpan} </div>
      <div> Duration: ${slider} </div>
      <div> ${startPauseBtn} </div>
      <div> ${resetBtn} </div>
    </div>
  `
}

document.body.appendChild(view(Timer()))
