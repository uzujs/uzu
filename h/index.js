const curryN = require('ramda/src/curryN')
const stream = require('../stream')

// Cached information to handle the circular dependencies in modelView
var cache = { }
function modelView (model, view) {
  cache.status = 'write'
  const {streams} = view({})
  const result = model(streams)
  cache.status = 'read'
  const {elm} = view(result)
  cache = {}
  return {elm, streams}
}


function h (sel, options, children) {
  if (!Array.isArray(children)) children = [children]
  if (cache.status === 'read') {
    var streams = cache.cached
  } else {
    var streams = {}
    // Create the event listener streams
    for (var event in options.streams) {
      var name = options.streams[event]
      streams[name] = stream.create()
    }
    // Merge in streams from child components
    for (var i = 0; i < children.length; ++i) {
      if (children[i] && children[i].streams) {
        for (var name in children[i].streams) {
          streams[name] = children[i].streams[name]
        }
      }
    }
  }
  // Cache streams and return immediately for the modelView() function
  if (cache.status === 'write') {
    cache.cached = streams
    return {streams}
  }

  const {tagName, selClass} = parseSelector(sel)
  var elm = document.createElement(tagName)

  // Bind streams to event handlers
  for (var event in options.streams) {
    var name = options.streams[event]
    elm.addEventListener(event, streams[name])
  }
  // Set inner content / children
  setInitialInner(elm, children)
  for (let i = 0; i < children.length; ++i) {
    if (stream.isStream(children[i])) {
      stream.map(c => updateInner(elm, c, i), children[i])
    }
  }

  // Set classes
  var classes = options.classes || {}
  setClassName(elm, selClass, classes)
  for (var name in classes) {
    if (stream.isStream(classes[name])) {
      stream.map(() => setClassName(elm, selClass, classes), classes[name])
    }
  }

  // Set props
  var props = options.props || {}
  assignProps(elm, props)
  for (var propName in props) {
    if(stream.isStream(props[propName])) {
      stream.map(() => assignProps(elm, props), props[propName])
    }
  }

  // Set attributes
  var attrs = options.attrs || {}
  setAttrs(elm, attrs)
  for (var attrName in attrs) {
    if(stream.isStream(attrs[attrName])) {
      stream.map(() => setAttrs(elm, attrs), attrs[attrName])
    }
  }

  return {elm, streams}
}

// Parse a selector string like div.x.y
function parseSelector (str) {
  const bits = str.split('.')
  const tagName = bits[0]
  const selClass = bits[1] ? bits.slice(1).join(' ') : '' 
  return {tagName, selClass}
}

// Set all the class names for an element
function setClassName (elm, selClass, classes) {
  var names = []
  for (var name in classes) {
    var p = classes[name]
    if (stream.isStream(p) && p() || !stream.isStream(p) && p) names.push(name)
  }
  elm.className = [selClass].concat(names).join(' ')
}

// Set properties on the dom element
function assignProps (elm, props) {
  for (var propName in props) {
    var v = props[propName]
    elm[propName] = stream.isStream(v) ? v() : v
  }
}

// Set attributes for an element using setAttribute
// Remove attributes with removeAttribute if the value is undefined
function setAttrs (elm, attrs) {
  for (var attrName in attrs) {
    var attr = attrs[attrName]
    var v = stream.isStream(attr) ? attr() : attr
    if (v === undefined) elm.removeAttribute(attrName)
    else elm.setAttribute(attrName, v)
  }
}

// Set new inner content on a stream update
function updateInner (elm, newVal, idx) {
  const node = getNode(newVal)
  const children = elm.childNodes
  const existing = children[idx]
  if (Array.isArray(node)) {
    // Replace existing
    for (var i = 0; i < node.length && i < children.length; ++i) {
      if (!node[i].isEqualNode(children[i])) {
        elm.replaceChild(node[i], children[i])
      }
    }
    // Append missing
    for (var i = children.length; i < node.length; ++i) {
      elm.appendChild(node[i])
    }
    // Remove extras
    for (var i = node.length; i < children.length; ++i) {
      elm.removeChild(children[i])
    }
  } else if (existing) {
    elm.replaceChild(node, existing)
  } else {
    elm.appendChild(node)
  }
}

// Set inner content on pageload
function setInitialInner (elm, children) {
  const existing = elm.childNodes
  const nodes = children.map(getNode)
  for (var i = 0; i < nodes.length; ++i) {
    elm.appendChild(nodes[i])
  }
}

// Get a node or array of nodes from some value in the h function's children
function getNode (val) {
  if (Array.isArray(val)) return val.map(getNode)
  if (val.tagName) return val
  if (val.elm) return val.elm
  var unwrapped = stream.isStream(val) ? val() : val
  return document.createTextNode(String(unwrapped))
}

module.exports = {
  h: curryN(3, h)
, modelView: curryN(2, modelView)
}
