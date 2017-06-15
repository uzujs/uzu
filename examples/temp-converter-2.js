const stream = require('../stream')
const h = require('../html')

const tempModel = ({fahrenInput, celsiusInput}) => {
  const celsius = stream.defaultTo(0, stream.map(convertToCelsius, getNumValue(fahrenInput)))
  const fahren  = stream.defaultTo(0, stream.map(convertToFahren, getNumValue(celsiusInput)))
  return {celsius, fahren}
}

// Utilities for tempConvert
const getNumValue = stream.map(ev => Number(ev.currentTarget.value))
const convertToCelsius = f => round((f - 32) / 1.8)
const convertToFahren = c => round(c * 1.8 + 32)
const round = n => Math.round(n * 100) / 100

const tempConverter = (temps) =>
  h('div', {}, [
    h('label', {}, 'Fahrenheit')
  , h('label', {}, 'Celsius')
  , h('input', {on: {input: temps.input.fahrenInput}, props: {value: temps.output.fahren, placeholder: 'out'}}, [])
  , h('input', {on: {input: temps.input.celsiusInput}, props: {value: temps.output.celsius, placeholder: 'out'}}, [])
  ])


// -- Render the DOM to the page and instantiate the model

const render = () => {
  const elm = tempConverter(stream.model(tempModel))
  document.body.appendChild(elm)
}

render()
