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
  })
}

// Toggle start or pause
function toggle (timer) {
  if (timer.state.running) {
    // Pause
    clearTimeout(timer.timeoutID)
    timer.update({
      timeoutID: null,
      state: timer.state.event('PAUSE')
    })
  } else {
    startTimer(timer)
  }
}

function reset (timer) {
  clearTimeout(timer.timeoutID)
  timer.update({
    timeoutID: null,
    elapsedMs: 0,
    state: timer.state.event('RESET')
  })
}

function setDuration (ev, timer) {
  timer.update({duration: ev.currentTarget.value * 1000})
}

const startTimer = (timer) => {
  // prevent timeouts from stacking when clicking reset
  timer.update({ state: timer.state.event('START') })
  let target = Date.now()
  function tick () {
    if (!timer.state.running) return
    if (timer.elapsedMs >= timer.duration) {
      return timer.update({ state: timer.state.event('DONE') })
    }
    var now = Date.now()
    target += 100
    const timeoutID = setTimeout(tick, target - now)
    timer.update({
      elapsedMs: timer.elapsedMs + 100,
      timeoutID: timeoutID
    })
  }
  tick()
}

function view (timer) {
  // inputs
  const slider = html`<input type='range' min=1 max=100 step="0.1" oninput=${ev => setDuration(ev, timer)} value=10>`
  const startPauseBtn = html`<button onclick=${() => toggle(timer)}> </button>`
  const resetBtn = html`<button onclick=${() => reset(timer)}> Reset </button>`
  // dynamic outputs
  const progress = html`<div class='progress'><div class='progress-bar'></div></div>`
  const secondsSpan = html`<span>0.0s</span>`
  const durationSpan = html`<span>10.0s</span>`
  const secondsWrapper = html`<p>${secondsSpan} / ${durationSpan}</p>`

  timer.onUpdate('state', state => {
    startPauseBtn.textContent = state.paused || state.reset ? 'Start' : 'Pause'
    startPauseBtn.disabled = state.finished
    resetBtn.disabled = state.reset
  })
  timer.onUpdate('elapsedMs', ms => {
    secondsSpan.textContent = (ms / 1000).toFixed(1) + 's'
    const perc = Math.round(timer.elapsedMs * 100 / timer.duration)
    if (perc <= 100) {
      progress.firstChild.style.width = perc + '%'
    }
  })
  timer.onUpdate('duration', ms => {
    durationSpan.textContent = (ms / 1000).toFixed(1) + 's'
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
      <div> ${secondsWrapper} </div>
      <div> Duration: ${slider} </div>
      <div> ${startPauseBtn} </div>
      <div> ${resetBtn} </div>
    </div>
  `
}

document.body.appendChild(view(Timer()))
