const R = require('ramda')
const {append, parent, bind, transform} = require('../html')
const stream = require('../stream')

// Utilities for tempConvert
const getNumValue = ev => Number(ev.currentTarget.value)
const convertToCelsius = f => round((f - 32) / 1.8)
const convertToFahren = c => round(c * 1.8 + 32)
const round = n => Math.round(n * 100) / 100

const Temps = ({inputCelsius, inputFahren}) => {
  const celsius = R.compose(
    stream.map(n => ({value: n}))
  , stream.map(round)
  , stream.map(convertToCelsius)
  , stream.map(getNumValue)
  )(inputFahren)
  const fahren = R.compose(
    stream.map(n => ({value: n}))
  , stream.map(round)
  , stream.map(convertToFahren)
  , stream.map(getNumValue)
  )(inputCelsius)
  return {celsius, fahren}
}

const view = (temps) => {
  const input = R.pipe(append('input'), transform({value: 0, type: 'number'}))
  const celsiusInput = R.pipe(input, bind('input', temps.input.inputCelsius))
  const fahrenInput = R.pipe(input, bind('input', temps.input.inputFahren))
  return R.pipe(
    append('div')
  , append('label'), transform({textContent: 'Celsius'})
  , parent
  , celsiusInput, transform(temps.output.celsius)
  , parent
  , append('label'), transform({textContent: 'Fahrenheit'})
  , parent
  , fahrenInput, transform(temps.output.fahren)
  )
}

const elmFn = view(stream.model(Temps))
elmFn(document.body)
