const model = require('../model')
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
  return model({name, id: id++, state: taskState})
}

function List () {
  return model({tasks: [], remaining: 0, filter: 'all'})
}

function toggleComplete (task, list) {
  if (task.state.completed) {
    task.update({state: task.state.event('PEND')})
    list.update({remaining: list.remaining + 1})
  } else {
    task.update({state: task.state.event('COMPLETE')})
    list.update({remaining: list.remaining - 1})
  }
}

// Add a new task from a form submit event
const addNew = list => ev => {
  ev.preventDefault() // form submit
  const name = ev.currentTarget.querySelector('input').value
  if (!name || !name.length) return
  ev.currentTarget.reset()
  list.update({
    tasks: list.tasks.concat([Task(name)]),
    remaining: list.remaining + 1
  })
}

function removeTask (task, list) {
  const tasks = list.tasks.filter(t => t.id !== task.id)
  // Recalculate total remaining
  // true -> 1, false -> 0
  const remaining = tasks.reduce((sum, t) => sum + Number(!t.state.completed), 0)
  list.update({tasks, remaining})
}

function showAll (list) {
  list.update({filter: 'all'})
  list.tasks.forEach(t => {
    t.update({state: t.state.event('SHOW')})
  })
}

function showActive (list) {
  list.update({filter: 'active'})
  list.tasks.forEach(t => {
    t.update({state: t.state.event(t.state.completed ? 'HIDE' : 'SHOW')})
  })
}

function showCompleted (list) {
  list.update({filter: 'completed'})
  list.tasks.forEach(t => {
    t.update({state: t.state.event(t.state.completed ? 'SHOW' : 'HIDE')})
  })
}

function view (list) {
  const taskForm = html`
    <form onsubmit=${addNew(list)}>
      <input type='text' placeholder='What needs to be done?'>
    </form>
  `
  const tasks = dom.childSync({
    view: taskView(list),
    model: list,
    key: 'tasks'
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
    <button onclick=${() => showAll(list)}> All </button>
  `
  const filterActiveBtn = html`
    <button onclick=${() => showActive(list)}> Active </button>
  `
  const filterCompletedBtn = html`
    <button onclick=${() => showCompleted(list)}> Completed </button>
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
    </div>
  `
}

const taskView = list => task => {
  const checkbox = html`
    <input type='checkbox' onchange=${() => toggleComplete(task, list)}>
  `
  const removeBtn = html`
    <button onclick=${() => removeTask(task, list)}>
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
