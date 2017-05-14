const curryN = require('ramda/src/curryN')
const stream = require('../stream')

function h (sel, options, children) {
  if (!Array.isArray(children)) children = [children]
  if (document._hReadCache) {
    var streams = document._hCachedStreams
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
  // Cache streams and return immediately for the component() function
  if (document._hCacheStreams) {
    document._hCachedStreams = streams
    return {streams}
  }

  const {tagName, selClass} = parseSelector(sel)
  var elm = document.createElement(tagName)

  // Bind streams to event handlers
  for (var event in options.streams) {
    var name = options.streams[event]
    elm.addEventListener(event, streams[name])
  }
  setInner(elm, children)
  for (var i = 0; i < children.length; ++i) {
    if (stream.isStream(children[i])) {
      stream.map(() => setInner(elm, children), children[i])
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
    var v = props[propName]
    if(stream.isStream(v)) {
      stream.map(() => assignProps(elm, props), v)
    }
  }

  // Set attributes
  var attrs = options.attrs || {}
  setAttrs(elm, attrs)
  for (var attrName in attrs) {
    var v = attrs[attrName]
    if(stream.isStream(v)) {
      stream.map(() => setAttrs(elm, attrs), v)
    }
  }

  return {elm, streams}
}

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

// Set inner content
// Also, find any new child streams
function setInner (elm, children) {
  var existing = elm.childNodes
  var nodes = getNodeChildren(children)
  for (var i = 0; i < nodes.length; ++i) {
    if(existing[i]) {
      if(!existing[i].isEqualNode(nodes[i])) {
        elm.replaceChild(nodes[i], existing[i])
      }
    } else {
      elm.appendChild(nodes[i])
    }
  }
  for (var i = nodes.length; i < existing.length; ++i) {
    elm.removeChild(existing[i])
  }
}

function getNodeChildren (children) {
  var nodes = []
  for (var i = 0; i < children.length; ++i) {
    var c = children[i]
    var v = stream.isStream(c) ? c() : c
    if (Array.isArray(v)) {
      nodes = nodes.concat(getNodeChildren(v))
    } else if (v.tagName) {
      nodes.push(v)
    } else if (v.elm) {
      nodes.push(v.elm)
    } else {
      nodes.push(document.createTextNode(String(v)))
    }
  }
  return nodes
}

module.exports = curryN(3, h)
