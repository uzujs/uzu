const {h, render} = require('../../experiment-render')
const {emit, get, component} = require('../../experiment')

component({
  scope: ['temps', 'fahren'],
  state: {val: 32, type: 'fahren'},
  on: {
    setCelsius: c => ({val: toFahren(c)}),
    setFahren: val => ({val})
  }
})

component({
  scope: ['temps', 'celsius'],
  state: {val: 0, type: 'celsius'},
  on: {
    setFahren: f => ({val: toCelsius(f)}),
    setCelsius: val => ({val})
  }
})

function view () {
  const celsius = get(['temps', 'celsius']).val
  const fahren = get(['temps', 'fahren']).val
  return h('div', [
    h('p', 'TempConv'),
    h('div', [
      h('input', {
        props: {type: 'number', value: celsius},
        on: {keyup: ev => emit(['temps', '*'], 'setCelsius', getVal(ev))}
      }),
      ' Celsius = ',
      h('input', {
        props: {type: 'number', value: fahren},
        on: {keyup: ev => emit(['temps', '*'], 'setFahren', getVal(ev))}
      }),
      ' Fahrenheit'
    ])
  ])
}

// Utils
const toCelsius = f => Math.round((f - 32) * (5 / 9))
const toFahren = c => Math.round(c * 1.8 + 32)
const getVal = ev => ev.currentTarget.value

const container = document.createElement('div')
document.body.appendChild(container)
render(container, view)
