
const counter = statechart.load('counter.json')

statechart.transition(eventName, parameters)

function increment (counter) {
  counter.transition('count', {n: counter.state.count + 1})
}

counter.on('count', n => {
  span.textContent = n
})

counter.state // 'count'

counter.transition('count', 

