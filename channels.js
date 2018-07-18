
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
  chan.listen = function (callback) {
    listeners.push(callback)
  }
  chan._isChannel = true
  return chan
}

Channel.combine = function (setters, initial) {
  const chan = Channel(initial)
  for (let i = 0; i < setters.length; ++i) {
    const setterChan = setters[i][0]
    const setterFn = setters[i][1]
    setterChan.listen(function (val) {
      chan(setterFn(chan(), val))
    })
  }
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
      bool.listen(function (b) {
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
      child.listen(function (val) {
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
  const total$ = Channel.combine([
    [c0.count$, (sum, c) => c0.count$() + c1.count$()],
    [c1.count$, (sum, c) => c0.count$() + c1.count$()]
  ], 0)
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
    'Total is ', total$,
    c0.node,
    c1.node
  ])
  return node
}

document.body.appendChild(CounterList())
