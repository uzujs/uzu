const Model = require('../model')
const Statechart = require('../statechart')
const dom = require('../dom')
const html = require('bel')

const taskState = Statechart({
  states: ['completed', 'pending', 'hidden', 'visible'],
  events: {
    COMPLETE: ['pending', 'completed'],
    PEND: ['completed', 'pending'],
    SHOW: [['hidden', 'visible'], ['visible', 'visible']],
    HIDE: [['visible', 'hidden'], ['hidden', 'hidden']]
  },
  initial: {pending: true, visible: true}
})

var id = 0
function Task (name) {
  return Model({name, id: id++, state: taskState}, {
    // trigger any state transition
    event: (evName, m, update) => update({state: m.state.event(evName)})
  })
}

function List () {
  return Model({tasks: [], remaining: 0, filter: 'all'}, {
    toggleComplete: (task, m, update) => {
      if (task.state.completed) {
        task.actions.event('PEND')
        update({remaining: m.remaining + 1})
      } else {
        task.actions.event('COMPLETE')
        update({remaining: m.remaining - 1})
      }
    },
    addNew: (ev, m, update) => {
      ev.preventDefault() // form submit
      const name = ev.currentTarget.querySelector('input').value
      if (!name || !name.length) return
      ev.currentTarget.reset()
      update({
        tasks: m.tasks.concat([Task(name)]),
        remaining: m.remaining + 1
      })
    },
    removeTask: (task, m, update) => {
      const tasks = m.tasks.filter(t => t.id !== task.id)
      // Recalculate total remaining
      // true -> 1, false -> 0
      const remaining = tasks.reduce((sum, t) => sum + Number(!t.state.completed), 0)
      update({tasks, remaining})
    },
    showAll: (_, m, update) => {
      update({filter: 'all'})
      m.tasks.forEach(t => t.actions.event('SHOW'))
    },
    showActive: (_, m, update) => {
      update({filter: 'active'})
      m.tasks.forEach(t => t.actions.event(t.state.completed ? 'HIDE' : 'SHOW'))
    },
    showCompleted: (_, m, update) => {
      update({filter: 'completed'})
      m.tasks.forEach(t => t.actions.event(t.state.completed ? 'SHOW' : 'HIDE'))
    },
    filterName: (ev, m, update) => {
      const val = ev.currentTarget.value
      m.tasks.forEach(t => {
        const match = t.name.indexOf(val) > -1
        t.actions.event(match ? 'SHOW' : 'HIDE')
      })
    }
  })
}

function view (list) {
  const taskForm = html`
    <form onsubmit=${list.actions.addNew}>
      <input type='text' placeholder='What needs to be done?'>
    </form>
  `
  const tasks = dom.childSync({
    view: taskView(list),
    container: 'div',
    model: list,
    prop: 'tasks'
  })
  return html`
    <div>
      ${taskForm}
      ${tasks}
      ${remainingView(list)}
      <hr>
      ${filters(list)}
    </div>
  `
}

// Show a tasks remaining message if remaining > 0
const remainingView = list => {
  const span = document.createElement('span')
  const remaining = html`<p> ${span} tasks remaining </p>`
  list.onUpdate('remaining', remaining => {
    span.textContent = remaining
    remaining.hidden = remaining === 0
  })
  return remaining
}

const filters = list => {
  const filterAllBtn = html`
    <button onclick=${list.actions.showAll}> All </button>
  `
  const filterActiveBtn = html`
    <button onclick=${list.actions.showActive}> Active </button>
  `
  const filterCompletedBtn = html`
    <button onclick=${list.actions.showCompleted}> Completed </button>
  `
  const filterInput = html`
    <input type='text' placeholder='By task name' onkeyup=${list.actions.filterName}>
  `
  list.onUpdate('filter', f => {
    filterAllBtn.disabled = f === 'all'
    filterActiveBtn.disabled = f === 'active'
    filterCompletedBtn.disabled = f === 'completed'
  })
  return html`
    <div>
      Filter by:
      <div> ${filterAllBtn} </div>
      <div> ${filterActiveBtn} </div>
      <div> ${filterCompletedBtn} </div>
      <div> ${filterInput} </div>
    </div>
  `
}

const taskView = list => task => {
  const checkbox = html`
    <input type='checkbox' onchange=${() => list.actions.toggleComplete(task)}>
  `
  const removeBtn = html`
    <button onclick=${() => list.actions.removeTask(task)}>
      remove
    </button>
  `
  const name = document.createElement('span')
  task.onUpdate('name', n => { name.textContent = n })

  const p = html` <p> ${checkbox} ${name} ${removeBtn} </p> `
  task.onUpdate('state', state => {
    p.hidden = state.hidden
    name.style.textDecoration = state.completed ? 'line-through' : 'none'
  })
  return p
}

document.body.appendChild(view(List()))
