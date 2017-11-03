'use strict'
const state = require('../index')
const dom = require('../dom')
const html = require('bel')

var uid = 0
function Task (name) {
  return state({name: name, id: uid++, completed: false, hidden: false})
}

function List () {
  return state({tasks: [], remaining: 0})
}

// append a new task to a List after a form submit
function submit (ev, list) {
  ev.preventDefault()
  const name = ev.currentTarget.querySelector('input').value
  if (!name || !name.length) return
  ev.currentTarget.reset()
  list.update({
    tasks: list.tasks.concat([Task(name)]),
    remaining: list.remaining + 1
  })
}

// remove a task from the list
function remove (task, list) {
  var tasks = list.tasks.filter(t => t.id !== task.id)
  list.update({
    tasks: tasks,
    // Recalculate total remaining
    // true -> 1, false -> 0
    remaining: tasks.reduce((sum, t) => sum + Number(!t.completed), 0)
  })
}

// complete or uncomplete a task
function toggleComplete (task, list) {
  list.update({remaining: task.completed ? list.remaining + 1 : list.remaining - 1})
  task.update({completed: !task.completed})
}

function showAll (list) {
  list.tasks.forEach(t => t.update({hidden: false}))
}

function showActive (list) {
  list.tasks.forEach(t => t.update({hidden: t.completed}))
}

function showCompleted (list) {
  list.tasks.forEach(t => t.update({hidden: !t.completed}))
}

function view (list) {
  const taskForm = html`
    <form onsubmit=${ev => submit(ev, list)}>
      <input type='text' placeholder='What needs to be done?'>
    </form>
  `

  const tasks = dom.childSync({
    view: taskView(list),
    container: 'div',
    state: list,
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

  list.on('remaining', rem => {
    span.textContent = rem
    remaining.style.display = (rem === 0) ? 'none' : 'block'
  })

  return remaining
}

const filters = list => {
  const filterAllBtn = html`
    <button onclick=${ev => showAll(list)}> All </button>
  `
  const filterActiveBtn = html`
    <button onclick=${ev => showActive(list)}> Active </button>
  `
  const filterCompletedBtn = html`
    <button onclick=${ev => showCompleted(list)}> Completed </button>
  `

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
    <input type='checkbox' onchange=${ev => toggleComplete(task, list)}>
  `
  const removeBtn = html`
    <button onclick=${ev => remove(task, list)}>
      remove
    </button>
  `
  const name = document.createElement('span')
  task.on('name', n => { name.textContent = n })
  task.on('completed', isCompleted => {
    name.style.textDecoration = isCompleted ? 'line-through' : 'none'
  })

  const p = html`
    <p> 
      ${checkbox}
      ${name}
      ${removeBtn}
    </p>
  `

  task.on('hidden', (isHidden) => {
    p.style.display = isHidden ? 'none' : 'block'
  })
  return p
}

document.body.appendChild(view(List()))
