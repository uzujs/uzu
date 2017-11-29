// const model = require('../../model')
const html = require('bel')
const statechart = require('../../statechart')

function Timer () {
  return {
    elapsedMs: 0,
    duration: 10000,
    timeoutID: null,
    chart: statechart({
      states: {
        initial: {paused: true, ticking: true, isReset: true},
        isReset: {TICK: 'notReset'},
        notReset: {RESET: 'isReset'},
        active: {TOGGLE: 'paused', RESET: 'active', DONE: 'finished'},
        paused: {TOGGLE: 'active', RESET: 'paused'},
        finished: {RESET: 'paused'},
        ticking: {RESET: 'ticking', TICK: 'ticking'}
      }
    })
  }
}

const resetTimer = (timer) => {
  timer.elapsedMs = 0
  timer.chart.event('RESET')
}

const startTimer = (timer) => {
  // prevent timeouts from stacking when clicking reset
  if (timer.timeoutID) window.clearTimeout(timer.timeoutID)
  timer.chart.event('TOGGLE')
  let intervalMS = 100
  let target = Date.now()
  function tick () {
    if (!timer.chart.state.active) return
    if (timer.elapsedMs >= timer.duration) {
      return timer.chart.event('DONE')
    }
    var now = Date.now()
    target += intervalMS
    const timeoutID = setTimeout(tick, target - now)
    timer.elapsedMs = timer.elapsedMs + 100
    timer.timeoutID = timeoutID
    timer.chart.event('TICK')
  }
  tick()
}

const setDuration = timer => ev => {
  const val = Number(ev.currentTarget.value) * 1000
  timer.duration = val // no state event needed
}

function view (timer) {
  // dynamic inputs
  const slider = html`<input type='range' min=0 max=100 step="0.1" oninput=${setDuration(timer)} value=10>`
  const resetBtn = html`<button onclick=${ev => resetTimer(timer)}> Reset </button>`
  const pausePlayBtn = html`<button onclick=${ev => startTimer(timer)}></button>`
  // dynamic outputs
  const progress = html`<div class='progress'><div class='progress-bar'></div></div>`
  const secondsSpan = html`<span>0.0s</span>`

  // Set the text and progress bar dynamic content based on the Timer chart parameters
  const setTimer = () => {
    const ms = timer.elapsedMs
    const duration = timer.duration
    secondsSpan.textContent = (ms / 1000).toFixed(1) + 's'
    // Set percentage width of the progress bar
    const perc = Math.round(ms * 100 / duration)
    if (perc <= 100) {
      progress.firstChild.style.width = perc + '%'
    }
  }
  timer.chart.when({
    active: () => {
      pausePlayBtn.textContent = 'Pause'
    },
    finished: () => {
      pausePlayBtn.disabled = true
      pausePlayBtn.textContent = 'Done!'
    },
    ticking: setTimer,
    paused: () => {
      pausePlayBtn.disabled = false
      pausePlayBtn.textContent = 'Start'
    },
    isReset: () => { resetBtn.disabled = true },
    notReset: () => { resetBtn.disabled = false }
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
      <div> ${resetBtn} </div>
      <div> ${pausePlayBtn} </div>
    </div>
  `
}

document.body.appendChild(view(Timer()))
