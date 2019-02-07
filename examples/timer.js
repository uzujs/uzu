// Countdown timer example
// Run locally with `budo --live --open examples/timer.js`
const { Component, h } = require('..')

function Timer (start) {
  return Component({
    // State
    interval: null,
    is_running: false,
    is_reset: true,
    is_finished: false,
    start,
    ms: start,
    // Methods
    toggle,
    reset,
    // View
    view
  })
}

function view () {
  return h('div', [
    h('p', [
      Math.round(this.ms / 1000),
      ' seconds left'
    ]),
    h('button', {
      props: {
        disabled: this.is_reset
      },
      on: {
        click: () => this.reset()
      }
    }, 'Reset'),
    h('button', {
      props: {
        disabled: this.is_finished
      },
      on: {
        click: () => this.toggle()
      }
    }, this.is_running ? 'Pause' : 'Start')
  ])
}

// Start or pause the timer
function toggle () {
  if (this.is_running) {
    clearInterval(this.interval)
    this.interval = null
    this.is_running = false
    this._render()
  } else if (!this.is_finished) {
    this.interval = setInterval(() => {
      this.ms -= 100
      if (this.ms <= 0) {
        clearInterval(this.interval)
        this.ms = 0
        this.is_finished = true
        this.is_running = false
      }
      this._render()
    }, 100)
    this.is_running = true
    this.is_reset = false
    this._render()
  }
}

// Reset the timer
function reset () {
  if (this.interval) {
    clearInterval(this.interval)
  }
  this.ms = this.start
  this.is_reset = true
  this.is_running = false
  this.is_finished = false
  this._render()
}

// The TimerList is a demonstration of the modularity and scalability of uzu.
// Components can be dynamically instantiated, removed, nested, and aggregated

let id = 0

function TimerList () {
  return Component({
    // State
    timers: [],
    // Methods
    append () {
      // Wrap each timer in an object with an id
      this.timers.push({
        id: id++,
        cmp: Timer(5000)
      })
      this._render()
    },
    remove (id) {
      this.timers = this.timers.filter(t => t.id !== id)
      this._render()
    },
    // View
    view () {
      return h('div', [
        h('button', {
          on: { click: () => this.append() }
        }, 'Add timer'),
        h('div', this.timers.map(timer => {
          return h('div', {
            // It's important for snabbdom to use a key here, when repeating dynamic components like this
            key: timer.id
          }, [
            h('hr'),
            h('button', { on: { click: () => this.remove(timer.id) } }, 'Remove timer'),
            timer.cmp.view()
          ])
        }))
      ])
    }
  })
}

document.body.appendChild(TimerList().view().elm)
