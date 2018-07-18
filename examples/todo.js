const {h, component, debug} = require('..')

var id = 0

function Task (name) {
  return component({
    state: {finished: false, name, hidden: false, id: id++},
    on: {
      TOGGLE: function (_, state, emit) {
        state.finished = !state.finished
        emit('UPDATE', state)
      },
      SHOW: function (_, state, emit) {
        state.hidden = false
        emit('UPDATE', state)
      },
      HIDE: function (_, state, emit) {
        state.hidden = true
        emit('UPDATE', state)
      }
    },
    view: function (state, emit) {
      return h('p', {
        key: state.id,
        class: {hide: state.hidden}
      }, [
        h('input', {
          props: {type: 'checkbox'},
          on: {change: () => emit('TOGGLE')}
        }),
        h('span', {
          style: {textDecoration: state.finished ? 'line-through' : 'none'}
        }, state.name),
        h('button', { on: {click: () => emit('REMOVE')} }, 'remove')
      ])
    }
  })
}

function TaskList () {
  return component({
    state: {tasks: [], remaining: 0, filtering: 'all'},
    on: {
      FILTER_COMPLETED: function (_, state, emit) {
        state.tasks.forEach(task => {
          if (task.state.finished) task.emit('SHOW')
          else task.emit('HIDE')
        })
        state.filtering = 'completed'
        emit('UPDATE', state)
      },
      FILTER_PENDING: function (_, state, emit) {
        state.tasks.forEach(task => {
          if (task.state.finished) task.emit('HIDE')
          else task.emit('SHOW')
        })
        state.filtering = 'pending'
        emit('UPDATE', state)
      },
      FILTER_ALL: function (_, state, emit) {
        state.tasks.forEach(task => { task.emit('SHOW') })
        state.filtering = 'all'
        emit('UPDATE', state)
      },
      COMPLETE_ALL: function (_, state, emit) {
        state.tasks.forEach(task => {
          task.state.finished = true
          task.emit('UPDATE', task.state)
        })
        state.remaining = getRemainingCount(state.tasks)
        emit('UPDATE', state)
      },
      TOGGLE: function (idx, state) {
        const task = state.tasks[idx]
        task.send('TOGGLE')
      },
      ADD_NEW: function (ev, state, emit) {
        // Add new todo item from form submit event
        ev.preventDefault()
        const input = ev.currentTarget.querySelector('input')
        const name = input.value
        input.value = ''
        if (!name || !name.length) return
        const newTask = Task(name)
        debug(newTask, 'task' + newTask.state.id)
        newTask.on('REMOVE', () => emit('REMOVE', newTask))
        newTask.on('TOGGLE', () => {
          state.remaining = getRemainingCount(state.tasks)
          emit('UPDATE', state)
        })
        state.tasks.push(newTask)
        state.remaining += 1
        emit('UPDATE', state)
      },
      REMOVE: function (task, state, emit) {
        state.tasks = state.tasks.filter(t => t.state.id !== task.state.id)
        state.remaining = getRemainingCount(state.tasks)
        emit('UPDATE', state)
      }
    },
    view: listView
  })
}

function getRemainingCount (tasks) {
  return tasks.reduce((sum, t) => sum + Number(!t.state.finished), 0)
}

function listView (state, emit) {
  return h('div', [
    h('style', {
      props: {
        innerHTML: '.hide {display: none;}'
      }
    }),
    h('form', {
      on: {submit: ev => emit('ADD_NEW', ev)}
    }, [
      h('input', {
        props: {type: 'text', placeholder: 'What needs to be done?'}
      })
    ]),
    h('div', state.tasks.map(t => t.vnode)),
    h('span', [state.remaining, ' tasks remaining']),
    h('hr'),
    filters(state, emit)
  ])
}

function filters (state, emit) {
  return h('div', [
    'Filter by: ',
    h('div', [
      h('button', {
        on: {click: () => emit('FILTER_ALL')},
        props: {disabled: state.filtering === 'all'}
      }, 'All')
    ]),
    h('div', [
      h('button', {
        on: {click: () => emit('FILTER_COMPLETED')},
        props: {disabled: state.filtering === 'completed'}
      }, 'Completed')
    ]),
    h('div', [
      h('button', {
        on: {click: () => emit('FILTER_PENDING')},
        props: {disabled: state.filtering === 'pending'}
      }, 'Pending')
    ])
  ])
}

const taskList = TaskList()
debug(taskList)

document.body.appendChild(taskList.node)
