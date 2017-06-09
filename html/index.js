const curryN = require('ramda/src/curryN')
const stream = require('../stream')

function h (sel, options, children) {
  if (options === undefined || children === undefined) {
    throw new TypeError("Wrong argument types for `h` function: pass in a selector, an object of options, and child nodes")
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
    if (getVal(p)) names.push(name)
  }
  elm.className = [selClass].concat(names).join(' ')
}

// Set properties on the dom element
function assignProps (elm, props) {
  for (var propName in props) {
    var v = props[propName]
    elm[propName] = getVal(v)
  }
}

// Set attributes for an element using setAttribute
// Remove attributes with removeAttribute if the value is undefined
function setAttrs (elm, attrs) {
  for (var attrName in attrs) {
    var attr = attrs[attrName]
    var v = getVal(attr)
    if (v === undefined) elm.removeAttribute(attrName)
    else elm.setAttribute(attrName, v)
  }
}

// Update all the children for an element
function handleChildren (elm, cs) {
  if (!Array.isArray(cs)) cs = [cs]
  for (let i = 0; i < cs.length; ++i) {
    const val = cs[i]
    if (stream.isStream(val)) {
      stream.scan(updateChildren(elm, i), 0, val)
    }
    updateChildren(elm, i)(0, getVal(val))
  }
}

// Update *all* children for a node
const updateChildren = (parent, idx) => (prevLen, children) => {
  if (!Array.isArray(children)) children = [children]

  // Append all children into a document fragment
  const newFrag = document.createDocumentFragment()
  for (let i = 0; i < children.length; ++i) {
    newFrag.appendChild(toNode(children[i]))
  }

  for (let i = idx; newFrag.childNodes.length > 0; ++i) {
    const older = parent.childNodes[i]
    const newer = newFrag.firstChild
    if (older) parent.replaceChild(newer, older)
    else parent.appendChild(newer)
  }
 
  // Remove extras
  for (let i = idx + children.length; i < prevLen; ++i) {
    parent.removeChild(parent.childNodes[i])
  }

  return children.length
}

// Convert a value into a node, if it's not already a node
function toNode (val) {
  if(val && val.nodeType && val.nodeType > 0) return val
  return document.createTextNode(val)
}

// Get a value from a plain value OR a stream
const getVal = val => stream.isStream(val) ? val() : val

module.exports = curryN(3, h)
