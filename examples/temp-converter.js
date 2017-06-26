const R = require('ramda')
const createElm = require('../html')
const stream = require('../stream')

// Utilities for tempConvert
const getNumValue = ev => Number(ev.currentTarget.value)
const convertToCelsius = f => round((f - 32) / 1.8)
const convertToFahren = c => round(c * 1.8 + 32)
const round = n => Math.round(n * 100) / 100

const Temps = ({inputCelsius, inputFahren}) => {
  const celsius = R.compose(
    stream.defaultTo(0)
  , stream.map(round)
  , stream.map(convertToCelsius)
  , stream.map(getNumValue)
  )(inputFahren)
  const fahren = R.compose(
    stream.defaultTo(0)
  , stream.map(round)
  , stream.map(convertToFahren)
  , stream.map(getNumValue)
  )(inputCelsius)
  return {celsius, fahren}
}

const view = (temps) => {
  return {
    tag: 'div'
  , children: [
      {tag: 'label', children: [ 'Celsius']}
    , {tag: 'input', on: {input: temps.input.inputCelsius}, props: {value: temps.output.celsius, type: 'number'}}
    , {tag: 'label', children: ['Fahrenheit']}
    , {tag: 'input', on: {input: temps.input.inputFahren}, props: {value: temps.output.fahren, type: 'number'}}
    ]
  }
}

const vnode = view(stream.model(Temps))
const div = createElm(vnode)
document.body.appendChild(div)
