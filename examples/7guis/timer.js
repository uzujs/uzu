const state = require('../../index')
const html = require('bel')

function Timer () {
  return state({
    elapsedMs: 0,
    duration: 10000,
    running: false,
    timeoutID: null
  })
}

const startTimer = (timer) => {
  // prevent timeouts from stacking when clicking reset
  if (timer.timeoutID) window.clearTimeout(timer.timeoutID)
  timer.update({elapsedMs: 0, running: true})
  var intervalMS = 100
  let target = Date.now()
  function tick () {
    if (!timer.running) return
    if (timer.elapsedMs >= timer.duration) {
      timer.update({running: false})
      return
    }
    var now = Date.now()
    target += intervalMS
    const timeoutID = setTimeout(tick, target - now)
    timer.update({elapsedMs: timer.elapsedMs + 100, timeoutID})
  }
  tick()
}

const setDuration = timer => ev => {
  const val = Number(ev.currentTarget.value) * 1000
  timer.update({duration: val})
}

function view (timer) {
  // dynamic inputs
  const slider = html`<input type='range' min=0 max=100 step="0.1" oninput=${setDuration(timer)} value=10>`
  const resetBtn = html`<button onclick=${ev => startTimer(timer)}> Reset </button>`
  // dynamic outputs
  const progress = html`<div class='progress'><div class='progress-bar'></div></div>`
  const secondsSpan = html`<span>0.0s</span>`

  timer.on('elapsedMs', s => { secondsSpan.textContent = (s / 1000).toFixed(1) + 's' })
  timer.on('elapsedMs', s => {
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
      <div> ${resetBtn} </div>
    </div>
  `
}

document.body.appendChild(view(Timer()))
