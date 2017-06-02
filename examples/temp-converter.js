const stream = require('../stream')
const h = require('../html')

const tempConverter = () => {
  const labelF = h('label', {}, 'Fahrenheit')
  const labelC = h('label', {}, 'Celsius')

  // event streams
  const inputFahren = stream.create()
  const inputCelsius = stream.create()
  const {celsius, fahren} = tempModel(inputFahren, inputCelsius)

  const inputF = h('input', {on: {input: inputFahren}, props: {value: fahren, placeholder: 'out'}}, [])
  const inputC = h('input', {on: {input: inputCelsius}, props: {value: celsius, placeholder: 'out'}}, [])

  return h('div', {}, [labelF, inputF, labelC, inputC])
}

const tempModel = (fahrenChange, celsiusChange) => {
  const celsius = stream.defaultTo(0, stream.map(convertToCelsius, getNumValue(fahrenChange)))
  const fahren  = stream.defaultTo(0, stream.map(convertToFahren, getNumValue(celsiusChange)))
  return {celsius, fahren}
}

// Utilities for tempConvert
const getNumValue = stream.map(ev => Number(ev.currentTarget.value))
const convertToCelsius = f => round((f - 32) / 1.8)
const convertToFahren = c => round(c * 1.8 + 32)
const round = n => Math.round(n * 100) / 100

document.body.appendChild(tempConverter())


