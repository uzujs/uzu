
function node (options) {
  // let state = 'init'
  const props = options.props || {}
  // const transitions = options.transitions || {}
  const on = options.on || {}
  const _listeners = []
  // if (transitions.initial) {
  //   state = transitions.initial
  // }
  // if (on[state]) {
  //   updateProps(on[state])
  // }

  // {sourceState: {event: destState}}
  // const transitionPaths = {}
  // for (let eventName in transitions) {
  //   let transitionPairs = transitions[eventName]
  //   console.log('transitionPairs', transitionPairs)
  //   for (let i = 0; i < transitionPairs.length; ++i) {
  //     let [sourceState, destState] = transitionPairs[i]
  //     console.log('source, dest', sourceState, destState)
  //     if (!transitionPaths[sourceState]) {
  //       transitionPaths[sourceState] = {}
  //     }
  //     if (transitionPaths[sourceState][eventName]) {
  //       throw new Error('Ambiguous transition "' + eventName + '"') // todo better messaging
  //     }
  //     transitionPaths[sourceState][eventName] = destState
  //   }
  // }

  function updateProps (fn, val) {
    // Call a function that takes props as args and returns props to merge
    const result = fn(val, props)
    if (result !== undefined) {
      for (let key in result) {
        props[key] = result[key]
        _listeners.forEach(fn => fn(props))
      }
      console.log('new state', props)
    }
  }

  function send (msg, data) {
    // if (!(msg in transitions)) {
    //   throw new Error('Invalid message: ' + msg)
    // }
    // const possibleTransitions = transitionPaths[state]
    // if (!possibleTransitions || !(msg in possibleTransitions)) {
    //   console.log(transitionPaths)
    //   throw new Error('Invalid transition "' + msg + '" from state "' + state + '"')
    // }
    // state = possibleTransitions[msg]
    if (!(msg in on)) {
      throw new Error('Invalid event: ' + msg)
    }
    updateProps(on[msg], data)
  }

  return {send, _listeners, _isNode: true}
}

// merge multiple nodes, plus static props
// merge(node1, node2, props)
// the rightmost props always override
// any event from any node will fire 

// todo node
// todo view

function view () {
  let validProps = ['text', 'disabled', 'selected', 'dataset', 'style', 'className'] // etc
  let propSources = {}
  let props = {}
  // merge all given props
  for (let i = 0; i < arguments.length; ++i) {
    let viewData = arguments[i]
    for (let j = 0; j < validProps; ++j) {
      let validProp = validProps[j]
      if (validProp in viewData) {
        props[validProp] = viewData[validProp]
        propSources[validProp] = viewData
      }
    }
    if (viewData._isNode) {
      viewData._listeners.push(function () {
      })
    }
  }
}

const toCelsius = f => Math.round((f - 32) * (5 / 9))
const toFahren = c => Math.round(c * 1.8 + 32)

const fahrenInput = node({
  props: {value: 32},
  on: {
    linkCelsius: c => {
      console.log('linking')
      return {celsius: c}
    },
    input: (value, {celsius}) => {
      celsius.send('setFahren', value)
    },
    setCelsius: c => {
      console.log('setting value of fahren (c, f)', c, toFahren(c))
      return {value: toFahren(c)}
    }
  }
})

const celsiusInput = node({
  props: {value: 0},
  on: {
    linkFahren: f => {
      console.log('linking')
      return {fahren: f}
    },
    input: (value, {fahren}) => {
      fahren.send('setCelsius', value)
    },
    setFahren: f => {
      console.log('setting value of celsius (f, c)', f, toCelsius(f))
      return {value: toCelsius(f)}
    }
  }
})

celsiusInput.send('linkFahren', fahrenInput)
fahrenInput.send('linkCelsius', celsiusInput)
celsiusInput.send('input', 100)
fahrenInput.send('input', -40)

/*

// component wrapper

// collection of components
// requires component constructor
const todoItems = collection(TodoItem, {
  collection: TodoItem,
  props: {copies: 1},
  receive: {
    add: (name, {copies}) => {
      return {copies: copies + 1}
    }
  }
})

const todoData = aggregate(todoItems, {
  props: {
    totalFinished: (items) => {
      return items.scan((i, sum) => i.finished + sum, 0)
    }
  }
})

totalCount, item
component({
  receive: {
    toggle: (bool, ({finished})) => {
      totalCount
      .send('
      return {finished: bool}
    }
  }
})

function view (component) {
  return extend(component, {
    props: {
      node: {
        dependencies: ['text', 'tag', 'value'],
        set: ({text, tag}) => {
          if (!props.tag) throw new Error('Must have a .tag to render')
          if (props.text
        }
      }
    }
  })
}

props({value: 32})
  .on({
    ..
  })

*/
