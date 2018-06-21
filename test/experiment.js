
const {emit, get, Component, globalState, del, updated} = require('../experiment')

var id = -1

// TODO double-splats ? eg. emit(['**', 'modal'], 'close')

function TodoItem (name) {
  id += 1
  return Component({
    scope: ['todo-item', id],
    state: {name, id, finished: false},
    on: {
      finish: () => ({finished: true}),
      unfinish: () => ({finished: false}),
      toggle: (_, {state}) => ({finished: !state.finished})
    }
  })
}

TodoItem('wash dishes')
TodoItem('fold the laundry')

function report () {
  console.log('count: ', get(['todo-item', '*']).length)
  console.log('finished: ', get(['todo-item', '*']).filter(i => i.finished).length)
  console.log('unfinished: ', get(['todo-item', '*']).filter(i => !i.finished).length)
}

report()

console.log('-- append')
TodoItem('party')
report()

console.log('-- finish all')
emit(['todo-item', '*'], 'finish')
report()

console.log('-- unfinish all')
emit(['todo-item', '*'], 'toggle')
report()

console.log('-- append & del')
TodoItem('party')
del(['todo-item', 3])
report()

const toCelsius = f => Math.round((f - 32) * (5 / 9))
const toFahren = c => Math.round(c * 1.8 + 32)

Component({
  scope: ['temps', 'fahren'],
  state: {val: 32, type: 'fahren'},
  on: {
    setCelsius: c => ({val: toFahren(c)}),
    setFahren: val => ({val})
  }
})

Component({
  scope: ['temps', 'celsius'],
  state: {val: 0, type: 'celsius'},
  on: {
    setFahren: f => ({val: toCelsius(f)}),
    setCelsius: val => ({val})
  }
})

const {h} = require('..')

function view () {
  return h('div', [
    h('input', {
      props: {type: 'number', value: get(['temps', 'celsius']).val},
      on: {
        input: ev => emit(['temps', '*'], 'setCelsius', ev.currentTarget.value)
      }
    }),
    ' Celsius = ',
    h('input', {
      props: {type: 'number', value: get(['temps', 'fahren']).val},
      on: {
        input: ev => emit(['temps', '*'], 'setFahren', ev.currentTarget.value)
      }
    }),
    ' Fahrenheit'
  ])
}

console.log(get(['temps', '*']))
emit(['temps', '*'], 'setCelsius', 100)
console.log(get(['temps', '*']))

// console.log(view())
