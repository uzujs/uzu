const R = require('ramda')
const createElm = require('../dom')
const stream = require('../stream')

// addNew and finish are streams of event objects
const Todos = ({addNew, finish}) =>
  stream.scanMerge([
    [addNew, appendTodo]
  , [finish, removeTodo]
  ], [])

var id = 0
const appendTodo = (todos, ev) => {
  ev.preventDefault()
  const name = ev.currentTarget.querySelector('input').value
  ev.currentTarget.reset()
  return R.append({name, id: ++id}, todos)
}

const removeTodo = (todos, ev) => {
  const id = Number(ev.currentTarget.id)
  const idx = R.findIndex(R.propEq('id', id), todos)
  return R.remove(idx, 1, todos)
}

const view = (todos) => {
  return {
    tag: 'div'
  , children: [
      {tag: 'p', children: ['Add some todos!']}
    , form(todos)
    , {tag: 'ul', children: todoItems(todos)}
    ]
  }
}

const todoItems = todos =>
  stream.map(items => items.map(item(todos)), todos.output)

const item = todos => todo => ({
  tag: 'li'
, id: todo.id
, children: [
    todo.name
  , finishBtn(todos)(todo)
  , {tag: 'input', type: 'checkbox'}
  ]
})

const finishBtn = todos => todo => ({
  tag: 'button'
, id: todo.id
, on: {click: todos.input.finish}
, children: ['Finished']
})

const form = todos => ({
  tag: 'form'
, on: {submit: todos.input.addNew}
, children: [
    {tag: 'input', type: 'text'}
  , {tag: 'button', children: ['Add todo']}
  ]
})


const render = () => {
  const elm = createElm(view(stream.model(Todos)))
  document.body.appendChild(elm)
}
render()
