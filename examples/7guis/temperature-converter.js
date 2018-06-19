const {h, component, debug} = require('../..')

const toCelsius = f => Math.round((f - 32) * (5 / 9))
const toFahren = c => Math.round(c * 1.8 + 32)

function Converter () {
  return component({
    state: {celsius: 0, fahren: 32},
    on: {
      SET_CELSIUS: function (ev, state, emit) {
        const val = ev.currentTarget.value
        state.fahren = toFahren(val)
        emit('UPDATE', state)
      },
      SET_FAHREN: function (ev, state, emit) {
        const val = ev.currentTarget.value
        state.celsius = toCelsius(val)
        emit('UPDATE', state)
      }
    },
    view: function (state, emit) {
      return h('div', [
        h('p', 'TempConv'),
        h('div', [
          h('input', {
            props: {type: 'number', value: state.celsius},
            on: {keyup: ev => emit('SET_CELSIUS', ev)}
          }),
          ' Celsius = ',
          h('input', {
            props: {type: 'number', value: state.fahren},
            on: {keyup: ev => emit('SET_FAHREN', ev)}
          }),
          ' Fahrenheit'
        ])
      ])
    }
  })
}

const converter = Converter()
debug(converter)

document.body.appendChild(converter.node)
