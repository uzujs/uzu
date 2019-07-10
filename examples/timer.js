// Multiple countdown timer example
// Run locally with `budo --live --open examples/timer.js`
const { Component, h } = require('..')

// A countdown timer component with a state machine
function Timer (start) {
  const data = {
    // Data
    interval: null, // setInterval reference
    start, // start time in ms
    ms: start // elapsed time in ms
  }
  return Component({
    data,
    // States and state transitions
    transitions: {
      initial: 'initial',
      reset: [{
        sources: ['running', 'finished', 'paused'],
        dest: 'initial',
        action: (timer) => {
          if (timer.interval) {
            clearInterval(timer.interval)
          }
          timer.ms = timer.start
        }
      }],
      // Start or pause
      toggle: [
        // start
        {
          sources: ['initial', 'paused'],
          dest: 'running',
          action: (timer) => {
            timer.interval = setInterval(() => {
              if (timer.ms <= 0) {
                clearInterval(timer.interval)
                timer.ms = 0
                timer.finish()
              } else {
                timer.ms -= 100
                timer._render()
              }
            }, 100)
          }
        },
        // pause
        {
          sources: ['running'],
          dest: 'paused',
          action: (timer) => {
            clearInterval(timer.interval)
            timer.interval = null
          }
        }
      ],
      finish: [{
        sources: ['running'],
        dest: 'finished'
      }]
    },
    view
  })
}

function view (timer) {
  return h('div', [
    h('p', [
      Math.ceil(timer.ms / 1000),
      ' seconds left'
    ]),
    h('button', {
      props: {
        disabled: timer.state === 'initial'
      },
      on: {
        click: () => timer.reset()
      }
    }, 'Reset'),
    h('button', {
      props: {
        disabled: timer.state === 'finished'
      },
      on: {
        click: () => timer.toggle()
      }
    }, timer.state === 'running' ? 'Pause' : 'Start')
  ])
}

let id = 0

// The TimerList is a demonstration of the modularity and scalability of uzu.
// Components can be dynamically instantiated, removed, nested, and aggregated
// Global controls can manipulate *all* child timers
function TimerList () {
  return Component({
    data: {
      timers: []
    },
    actions: {
      // Methods
      append (list) {
        // Wrap each timer in an object with an id
        const timer = Timer(5000)
        const _id = id++
        timer._emitter.on('state:finished', (obj) => {
          console.log('timer finished!', timer)
        })
        list.timers.push({ id: _id, cmp: timer })
        list.totalInitial += 1
      },
      remove (list, id) {
        list.timers = list.timers.filter(t => t.id !== id)
      }
    },
    view (list) {
      return h('div', [
        h('button', {
          on: { click: () => list.append() }
        }, 'Add timer'),
        h('div', list.timers.map(timer => {
          return h('div', {
            // It's important for snabbdom to use a key here, when repeating dynamic components like this
            key: timer.id
          }, [
            h('hr'),
            h('button', { on: { click: () => list.remove(timer.id) } }, 'Remove timer'),
            timer.cmp.view()
          ])
        }))
      ])
    }
  })
}

const el = TimerList().view().elm
document.body.appendChild(el)
