// const snabbdom = require('snabbdom')
// const patch = snabbdom.init([
//   require('snabbdom/modules/class').default,
//   require('snabbdom/modules/props').default,
//   require('snabbdom/modules/style').default,
//   require('snabbdom/modules/eventlisteners').default,
//   require('snabbdom/modules/dataset').default,
//   require('snabbdom/modules/attributes').default
// ])
const h = require('snabbdom/h').default

function Actor ({state, receivers}) {
  function update (obj) {
    for (let key in obj) {
      state[key] = obj[key]
    }
    return state
  }
  function send (msg, data) {
    if (!(msg in receivers)) {
      throw new Error('Unable to receive message. Received: ' + msg + '. Can receive: ' + Object.keys(receivers))
    }
    receivers[msg](data, state, update)
  }

  return {send}
}

function Counter (sup) {
  return {
    state: {c: 0},
    receivers: {
      add: (n, state, update) => {
        const count = state.c + 1
        update({c: count})
        sup.send('merge_state', {count})
      }
    }
  }
}

function State (sup) {
  return {
    state: {count: 0},
    receivers: {
      merge_state: (obj, state, update) => {
        state = update(obj)
        console.log('state is', state)
        sup.send('updated_state', state)
      }
    }
  }
}

function View (sup) {
  function view (state) {
    return h('div', [
      h('p', ['Count is ', state.count]),
      h('button', {on: {click: () => sup.send('add', 1)}}, 'Increment')
    ])
  }
  return {
    state: {vnode: h('div')},
    receivers: {
      updated_state: (obj, state, update) => {
        state = update({vnode: view(obj)})
        sup.send('new_vnode', state)
      }
    }
  }
}

function Cluster (children, ns, supSend) {
  const receivers = {}
  function send (msg, data) {
    receivers[msg].send(msg, data)
    if (ns && supSend) {
      supSend(ns + '/' + msg, data)
    }
  }
  const sup = {send}
  children.forEach(child => {
    const childOpts = child(sup)
    const childActor = Actor(childOpts)
    for (let msgName in childOpts.receivers) {
      receivers[msgName] = childActor
    }
  })
  console.log('receivers', receivers)
  return sup
}

function CounterComponent (id, send) {
  return Cluster([View, State, Counter], 'counter', send)
}

var id = 0
function CounterList (sup) {
  return {
    state: {counters: []},
    receivers: {
      append: (_, state, update) => {
        const counter = CounterComponent(++id, send)
        const counterList = state.counters.append([counter])
        state = update({counters: counterList})
        sup.send('updated_state', state)
      }
    }
  }
}

function CounterAgg () {
  // array of:
  // {vnode, count}
  // for each counter
  return {
    state: {cs: []},
    receivers: {
      append: (_, state, send) => {
        const addr = CounterComponent({
          updated_vnode: (vnode) => send('set', {vnode}),
          updated_state: ({count}) => send('set', {count})
        })
        const cs = state.cs.append(Counter
        state = update({cs: counters})
      }
    }
  }
}

function CounterListView () {
  const view = state => {
    return h('div', [
      h('div', state.counters.map(c => c.vnode))
    ])
  }
  return {
    state: {vnode: h('div')},
    receivers: {
      updated_state: (obj, state, update) => {P{
        update({vnode: view(obj)})
      }
    }
  }
}

// counter component
