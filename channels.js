
// TODO
// how to handle memory management
//   when you delete a channel..
//   but it is listening to another channel
//   we need to delete the listener
//
// a person is created
//   which gets passed a selected$ channel
//   it creates an isSelected$ channel deriving from selected$
//   which adds a listener to selected$
// the person is deleted
//   the isSelected$ channel is garbage collected
//   you have to call isSelected$.unlisten()
//   ORRRR a derived channel is read only -- its just a function -  you cant push to it - but then the dom doesnt update
//   or you have events and you have data
/*
on('app', 'select', name => {
  emit('app', 'selected', name)
})
function person (name, selectedPerson) {
  return Elem('div', [
    Elem('div', {
      class: {active: dynamic('app', 'selected', () => selectedPerson === name)},
      on: {click: () => emit('app', 'select', name)}
    }, [name])
  ])
}
*/

let id = 0

function Modal () {
  const ns = 'modal-' + Math.random()
  const vnode = h('div', {
    scope: ns,
    class: {opened: listen(ns, 'opened')}
  }, [
    h('button', {on: {click: () => emit(ns, 'opened', false)}}, 'close')
  ])
  return {vnode, ns}
}

function Channel () {
  let val
  let listeners = []
  const chan = function () {
    if (arguments.length === 1) {
      val = arguments[0]
      for (let i = 0; i < listeners.length; ++i) {
        listeners[i](val)
      }
    } else {
      return val
    }
  }
  if (arguments.length === 1) {
    chan(arguments[0])
  }
  chan._listen = function (callback) {
    listeners.push(callback)
  }
  chan._isChannel = true
  chan._updated = Date.now()
  chan._id = ++id
  chan.map = function (cb) {
    const newChan = function () {
      return cb(chan())
    }
    newChan._listen = function (cb) {
      chan._listen(cb)
    }
    newChan._isChannel = true
    newChan._id = ++id
    newChan._updated = Date.now()
    return newChan
  }
  chan.scan = function (cb, starting) {
    let val = starting
    let lastUpdated = chan._updated
    const newChan = function () {
      if (chan._updated > lastUpdated) {
        val = cb(val, chan())
        lastUpdated = chan._updated
      }
      return val
    }
    return newChan
  }
  return chan
}

Channel.map = function (chan, cb) {
}

Channel.combine = function (setters, initial) {
  let val = initial
  const newChan = function () {
    return val
  }
  let updated = {}
  let listeners = []
  function setVal () {
    for (let i = 0; i < setters.length; ++i) {
      const setterChan = setters[i][0]
      const setterFn = setters[i][1]
      if (updated[setterChan._id] < setterChan._updated) {
        val = setterFn(setterChan())
        newChan._updated = Date.now()
      }
    }
  }
  newChan._listen = function (cb) {
    listeners.forEach(l => l._listen(cb))
  }
  newChan._isChannel = true
  newChan._id = ++id
  return chan
}

function isPlainObject (obj) {
  return obj && typeof obj === 'object' && obj.constructor === Object
}

function Elem (selector) {
  let options = {}
  let children = []
  if (arguments.length === 3) {
    options = arguments[1]
    children = arguments[2]
  } else if (arguments.length === 2) {
    if (isPlainObject(arguments[1])) {
      children = arguments[1]
    } else {
      children = arguments[1]
    }
  }
  if (!Array.isArray(children)) children = [children]
  const selectorPieces = selector.split('.')
  const tagname = selectorPieces[0]
  const className = selectorPieces.slice(1).join(' ')
  const node = document.createElement(tagname)
  node.className = className

  // Classes
  const classes = options.classes || {}
  for (let className in classes) {
    const bool = classes[className]
    if (bool._isChannel) {
      bool._listen(function () {
        const b = bool()
        if (b) {
          node.classList.add(className)
        } else {
          node.classList.remove(className)
        }
      })
    } else if (bool) {
      node.classList.add(className)
    }
  }

  // Events
  const events = options.on || {}
  for (let eventName in events) {
    const handler = events[eventName]
    node.addEventListener(eventName, function (ev) {
      handler(ev)
    })
  }

  // Children
  for (let i = 0; i < children.length; ++i) {
    const child = children[i]
    console.log('child', child)
    if (child && typeof child === 'function' && child._isChannel) {
      let childNode = getNode(child())
      console.log('childNode', childNode)
      node.appendChild(childNode)
      child._listen(function () {
        const val = child()
        const newChild = getNode(val)
        node.replaceChild(newChild, childNode)
        childNode = newChild
      })
    } else {
      node.appendChild(getNode(child))
    }
  }

  return node
}

function getNode (val) {
  if (val && typeof val === 'object' && val.tagName) {
    return val
  } else {
    return document.createTextNode(String(val))
  }
}

function Counter (initial) {
  const count$ = Channel(initial)
  const actions = {
    add: n => count$(count$() + n)
  }
  const node = Elem('div', [
    Elem('p', ['Count is ', count$]),
    Elem('button', {on: {click: () => actions.add(1)}}, 'Increment'),
    Elem('button', {on: {click: () => actions.add(-1)}}, 'Decrement')
  ])
  return {count$, actions, node}
}

function CounterList () {
  const c0 = Counter(0)
  const c1 = Counter(1)
  listener(['counters', '*'], 'count').scan((sum, c) => sum + c, 0)
  const total = combine([
    [listener(c0.ns, 'count'), (sum, c) => sum + c]
  const total = listen([c0.count$, c1.count$], () => {
    return c0.count$() + c1.count$()
  })
  const node = Elem('div', [
    Elem('button', {
      on: {
        click: () => {
          c0.actions.add(1)
          c1.actions.add(1)
        }
      }
    }, 'Increment all'),
    Elem('button', {
      on: {
        click: () => {
          c0.actions.add(-1)
          c1.actions.add(-1)
        }
      }
    }, 'Decrement all'),
    Elem('button', {
      on: {
        click: () => {
          c0.actions.add(-c0.count$())
          c1.actions.add(-c1.count$())
        }
      }
    }, 'Reset all'),
    'Total is ', total,
    c0.node,
    c1.node
  ])
  return node
}

document.body.appendChild(CounterList())

/*

// a bus can receive messages
// you can create a bus with Bus() and send messages to the bus with bus(name, val)
// a reducer listens to messages on a bus and produces a single value
// a reducer can send back messages to a bus whenever it updates with reducer.send(msgName, bus)
//
// a vnode is a virtual dom node that can be efficiently updated with new data

// you can only listen on creation

function Counter () {
  const bus = Bus()
  const count = bus.reduce({
    start: 0,
    on: {
      incr: (_, c) => {
        send('total', c + 1)
        return c + 1
      }
    }
  })
  const view = (c) => h('button', {on: {click: bus.send('incr')}}, ['Count is ', c])
  const vnode = bus.reduce({
    start: view(0),
    on: {
      total: view
    }
  })
  return {bus, count, vnode}
}

const person = component({
  count: 3,
  states: 
})

function Person (selectedBus, id) {
  const view = (selected) => {
    return h('div', {
      on: {click: () => selectedBus.send('select', id)},
      class: {selected}
    }, [ id ])
  }
  const selected = selectedBus
  const vnode = selectedBus.reduce({
    start: view(false),
    on: {
      select: sid => view(sid === id)
    }
  })
}

kl

function CounterList () {
  const bus = Bus()
  const countBus = Bus()
  const list = bus.reduce({
    start: [],
    on: {
      append: (_, ls) => {
        const counter = Counter()
        ls = ls.concat([Counter()])
        counter.count.send('count', countBus)
        bus.send('listing', ls)
        return ls
      }
    }
  })
  const view = cs => {
    return h('div', [
      h('button', {on: {click: () => bus.send('append')}}),
      h('div', cs.map(c => c.vnode))
    ])
  }
  const vnode = bus.reduce({
    start: view([]),
    on: {listing: view}
  })
  const total = totalBus.reduce({
    start: 0, 
    on: {
      // Whenever there is a 'total' message on totalBus, then sum all the counts
      total: () => list.current.reduce((sum, c) => sum + c.count.current, 0)
    }
  })
  return {vnode, bus, list}
}

const c1 = Counter()
c1.count.broadcast('total', totalBus)

const listBus = bus()
const counters = listBus.reduce({
  start: [],
  on: {
    append: (_, cs) => {
      cs.push(Counter())
      return cs
    }
  }
})

function CountBtn () {

}

function CounterList () {
  return {
  }
}
*/
