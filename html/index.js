const curryN = require('ramda/src/curryN')
const stream = require('../stream')

function h (sel, options, children) {
  if (options === undefined || children === undefined) {
    throw new Error("Wrong argument types for `h` function: pass in a selector, an object of options, and child nodes")
  }
  const {tagName, selClass} = parseSelector(sel)
  var elm = document.createElement(tagName)

  // Set inner content / children
  handleChildren(elm, children)  

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

  // Add event handlers
  if (options.on) {
    for (var event in options.on) {
      elm.addEventListener(event, options.on[event])
    }
  }

  return elm
}

// Parse a selector string with class names like div.x.y
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

// Update all the children for an element
function handleChildren (elm, cs) {
  if (stream.isStream(cs)) {
    stream.map(v => updateAllChildren(elm, v), cs)
    if(cs() !== undefined) updateAllChildren(elm, cs())
    return
  } 
  if (!Array.isArray(cs)) cs = [cs]
  while (cs.length) {
    const val = cs.shift()
    if (stream.isStream(val)) {
      const initialVal = val()
      // Stream of nodes
      if (initialVal.nodeType && initialVal.nodeType > 0) {
        elm.appendChild(initialVal)
        stream.map(n => elm.replaceChild(n, elm.children[i]), val)
      } 
      // Stream of primitive vals
      else { // treat it as a string
        var txt = document.createTextNode(String(initialVal))
        stream.map(v => {txt.textContent = v}, val)
        elm.appendChild(txt)
      }
    } else {
      elm.appendChild(toNode(val))
    }
  }
}

// Update *all* children for a node
// This is useful when the child of a node is a stream of arrays of nodes
function updateAllChildren (elm, children) {
  if (!Array.isArray(children)) children = [children]
  // Append or replace
  for (var i = 0; i < children.length; ++i) {
    if (elm.childNodes[i]) {
      if (elm.childNodes[i].nodeType === 3) { // text node
        elm.childNodes[i].textContent = String(children[i])
      } else {
        elm.replaceChild(children[i], elm.childNodes[i])
      }
    } else {
      elm.appendChild(toNode(children[i]))
    }
  }
  // Remove extras
  for (var i = children.length; i < elm.children.length; ++i) {
    elm.removeChild(elm.children[i])
  }
}

function toNode (val) {
  if(val && val.nodeType && val.nodeType > 0) return val
  return document.createTextNode(val)
}

module.exports = curryN(3, h)
