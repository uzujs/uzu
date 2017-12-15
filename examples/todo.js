const channel = require('../channel')
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
  return {name, id: id++, state: channel(taskState)}
}

function List () {
  return {tasks: channel([]), remaining: channel(0), filter: channel('all')}
}

function toggleComplete (task, list) {
  if (task.state.value.completed) {
    task.state.send(task.state.value.event('PEND'))
    list.remaining.send(list.remaining.value + 1)
  } else {
    task.state.send(task.state.value.event('COMPLETE'))
    list.remaining.send(list.remaining.value - 1)
  }
}

// Add a new task from a form submit event
const addNew = list => ev => {
  ev.preventDefault() // form submit
  const name = ev.currentTarget.querySelector('input').value
  if (!name || !name.length) return
  ev.currentTarget.reset()
  list.tasks.send(list.tasks.value.concat([Task(name)]))
  list.remaining.send(list.remaining.value + 1)
}

function removeTask (task, list) {
  const tasks = list.tasks.value.filter(t => t.id !== task.id)
  // Recalculate total remaining
  // true -> 1, false -> 0
  const remaining = tasks.reduce((sum, t) => sum + Number(!t.state.value.completed), 0)
  list.tasks.send(tasks)
  list.remaining.send(remaining)
}

function showAll (list) {
  list.filter.send('all')
  list.tasks.value.forEach(t => { t.state.send(t.state.value.event('SHOW')) })
}

function showActive (list) {
  list.filter.send('active')
  list.tasks.value.forEach(t => {
    t.state.send(t.state.value.event(t.state.value.completed ? 'HIDE' : 'SHOW'))
  })
}

function showCompleted (list) {
  list.filter.send('completed')
  list.tasks.value.forEach(t => {
    t.state.send(t.state.value.event(t.state.value.completed ? 'SHOW' : 'HIDE'))
  })
}

function view (list) {
  const taskForm = html`
    <form onsubmit=${addNew(list)}>
      <input type='text' placeholder='What needs to be done?'>
    </form>
  `
  const tasks = dom.childSync({
    channel: list.tasks,
    view: taskView(list)
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
  list.remaining.listen(remaining => {
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
  list.filter.listen(f => {
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
  const name = html`<span> ${task.name} </span>`

  const p = html` <p> ${checkbox} ${name} ${removeBtn} </p> `
  task.state.listen(state => {
    p.hidden = state.hidden
    name.style.textDecoration = state.completed ? 'line-through' : 'none'
  })
  return p
}

document.body.appendChild(view(List()))
