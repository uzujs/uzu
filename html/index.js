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
    else if (String(child.dataset.id) !== String(getVal(vchild.dataset.id))) {
      elm.removeChild(child)
    }
  }
  // remove extras from the end
  for (let i = vnode.children.length; i < elm.childNodes.length; ++i) {
    elm.removeChild(elm.lastChild)
  }
  return elm
}

const getVal = v => stream.isStream(v) ? v() : v
const vnodeKeys = ['props', 'dataset', 'attrs']

// Update a DOM node given a set of properties and attributes
const updateElm = elm => vnode => {
  if (elm.nodeType === 3 && elm.textContent !== vnode) {
    elm.textContent = String(vnode)
    return elm
  }
  const updaters = {
    props: (n, val) => elm[n] = val
  , attrs: (n, val) => val === undefined || val === null
      ? elm.removeAttribute(n)
      : elm.setAttribute(n, val)
  , dataset: (n, val) => elm.dataset[n] = val
  }

  vnodeKeys.filter(k => vnode.hasOwnProperty(k)).forEach(k => {
    for (let n in vnode[k]) updaters[k](n, getVal(vnode[k][n]))
  })
  return elm
}

const createElm = (vnode) => {
  if (stream.isStream(vnode)) {
    let elm = createElm(vnode())
    stream.map(updateElm(elm), vnode)
    return elm
  } else if (typeof vnode !== 'object') {
    return document.createTextNode(String(vnode))
  } else if (vnode.nodeType > 0) {
    return vnode
  }

  if (!vnode.tag) throw new TypeError("Uzu node must have a tag property")
  let elm = document.createElement(vnode.tag)
  updateElm(elm)(vnode)

  vnodeKeys.filter(k => vnode.hasOwnProperty(k)).forEach(k => {
    for (let n in vnode[k]) {
      if (stream.isStream(vnode[k][n])) {
        let updater = { [k]: { [n]: vnode[k][n] }}
        stream.map(() => updateElm(elm)(updater), vnode[k][n])
      }
    }
  })
  if (vnode.children) {
    if (stream.isStream(vnode.children)) {
      stream.map(v => syncChildren(elm, {children: v}), vnode.children)
    } else {
      vnode.children.forEach(child => elm.appendChild(createElm(child)))
    }
  }
  for (let n in vnode.on || {}) elm.addEventListener(n, vnode.on[n])
  return elm
}

module.exports = createElm
