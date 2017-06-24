const curryN = require('ramda/src/curryN')
const stream = require('../stream')

// Given a dom node and a vnode that have a stream of childnodes
// update all the children for the dom node based on data in the vnode
const syncChildren = (elm, vnode) => {
  if (!elm || elm.nodeType !== 1) return elm
  for (let i = 0; i < vnode.children.length; ++i) {
    let child = elm.childNodes[i]
    let vchild = getVal(vnode.children[i])
    if (!child) elm.appendChild(createElm(vnode.children[i]))
    else if (child.id && vchild.props && child.id !== String(getVal(vchild.props.id))) {
      elm.removeChild(child)
    } else updateElm(child)(vchild)
  }
  // remove extras
  for (let i = vnode.children.length; i < elm.childNodes.length; ++i) {
    elm.removeChild(elm.lastChild)
  }
  return elm
}

const getVal = v => stream.isStream(v) ? v() : v

// Update a DOM node given a set of properties and attributes
const updateElm = elm => vnode => {
  if (elm.nodeType === 3 && elm.textContent !== vnode) {
    elm.textContent = String(vnode)
    return elm
  }
  const inNode = n => vnode.hasOwnProperty(n)
  for (let n in vnode.props || {}) elm[n] = getVal(vnode.props[n])
  for (let n in vnode.attrs || {}) {
    if (vnode.attrs[n] === undefined || vnode.attrs[n] === null) {
      elm.removeAttribute(n)
    } else {
      elm.setAttribute(n, getVal(vnode.attrs[n]))
    }
  }
  for (let n in vnode.dataset || {}) elm.dataset[n] = vnode.dataset[n]
  return elm
}

const createElm = (vnode) => {
  const val = getVal(vnode)
  let elm
  if (typeof val === 'string' || typeof val === 'number') {
    elm = document.createTextNode(String(val))
  } else {
    if (!val.tag) throw new TypeError("Uzu node must have a tag property")
    elm = document.createElement(val.tag)
  }
  
  if (stream.isStream(vnode)) stream.map(updateElm(elm), vnode)
  else updateElm(elm)(val)

  for (let n in val.props || {}) {
    if (stream.isStream(val[n])) {
      let updater = {props: { [n]: val[n] }}
      stream.map(() => updateElm(elm)(updater), val.props[n])
    }
  }
  if (val.dataset) {
    for (let n in val.dataset) {
      if (stream.isStream(val.dataset[n])) {
        let updater = {dataset: { [n]: v }}
        stream.map(v => updateElm(elm)(updater), val.dataset[n])
      }
    }
  }
  if (val.children) {
    if (stream.isStream(val.children)) {
      stream.map(v => syncChildren(elm, {children: v}), val.children)
    } else {
      val.children.forEach(child => elm.appendChild(createElm(child)))
    }
  }
  for (let n in val.on || {}) elm.addEventListener(n, val.on[n])
  return elm
}

module.exports = createElm

