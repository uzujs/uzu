const channel = require('../../channel')
const statechart = require('../../statechart')
const html = require('bel')

function Timer () {
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

  return {
    elapsedMs: channel(0),
    duration: channel(10000),
    timeoutID: null,
    state: state
  }
}

// Toggle start or pause
function toggle (timer) {
  if (timer.state.value.running) {
    // Pause
    clearTimeout(timer.timeoutID)
    timer.timeoutID = null
    timer.state.event('PAUSE')
  } else {
    startTimer(timer)
  }
}

function reset (timer) {
  clearTimeout(timer.timeoutID)
  timer.timeoutID = null
  timer.elapsedMs.send(0)
  timer.state.event('RESET')
}

function setDuration (ev, timer) {
  timer.duration.send(ev.currentTarget.value * 1000)
}

const startTimer = (timer) => {
  // prevent timeouts from stacking when clicking reset
  timer.state.event('START')
  let target = Date.now()
  function tick () {
    if (!timer.state.value.running) return
    if (timer.elapsedMs.value >= timer.duration.value) {
      timer.state.event('DONE')
    }
    var now = Date.now()
    target += 100
    const timeoutID = setTimeout(tick, target - now)
    timer.elapsedMs.send(timer.elapsedMs.value + 100)
    timer.timeoutID = timeoutID
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

  timer.state.listen(state => {
    startPauseBtn.textContent = state.paused || state.reset ? 'Start' : 'Pause'
    startPauseBtn.disabled = state.finished
    resetBtn.disabled = state.reset
  })
  timer.elapsedMs.listen(ms => {
    secondsSpan.textContent = (ms / 1000).toFixed(1) + 's'
    const perc = Math.round(ms * 100 / timer.duration.value)
    if (perc <= 100) {
      progress.firstChild.style.width = perc + '%'
    }
  })
  timer.duration.listen(ms => {
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
