const stream = require('../stream')
const {modelView, h} = require('../html')

const tempConvert = ({changeCelsius, changeFahren}) => {
  const celsius = stream.map(convertToCelsius, getNumValue(changeFahren))
  const fahren = stream.map(convertToFahren, getNumValue(changeCelsius))
  return {celsius, fahren}
}

// Utilities for tempConvert
const getNumValue = stream.map(ev => Number(ev.currentTarget.value))
const convertToCelsius = f => round((f - 32) / 1.8)
const convertToFahren = c => round(c * 1.8 + 32)
const round = n => Math.round(n * 100) / 100

const tempView = ({celsius, fahren}) =>
  h('div', {}, [
    h('label', {}, 'Celsius')
  , h('input', {props: {type: 'number', value: celsius}, streams: {input: 'changeCelsius'}}, [])
  , h('br', {}, [])
  , h('label', {}, 'Fahrenheit')
  , h('input', {props: {type: 'number', value: fahren}, streams: {input: 'changeFahren'}}, [])
  ])

const {elm} = modelView(tempConvert, tempView)
document.body.appendChild(elm)

