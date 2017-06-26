const curryN = require('ramda/src/curryN')
const stream = require('../stream')

// Given a dom node and a vnode that have a stream of childnodes
// update all the children for the dom node based on data in the vnode
const syncChildren = (elm, children, updaters) => {
  if (!elm || elm.nodeType !== 1) return elm
  for (let i = 0; i < children.length; ++i) {
    let child = elm.childNodes[i]
    let vchild = getVal(children[i])
    if (!child) elm.appendChild(createElm(children[i], updaters))
    else if (String(child.dataset.id) !== String(getVal(vchild.dataset.id))) {
      elm.removeChild(child)
    }
  }
  // remove extras from the end
  for (let i = children.length; i < elm.childNodes.length; ++i) {
    elm.removeChild(elm.lastChild)
  }
  return elm
}

const getVal = v => stream.isStream(v) ? v() : v

const defaultUpdaters = {
  props: (elm, n, val) => elm[n] = val
, attrs: (elm, n, val) => val === undefined || val === null
    ? elm.removeAttribute(n)
    : elm.setAttribute(n, val)
, dataset: (elm, n, val) => elm.dataset[n] = val
, class: (elm, n, val) => val ? elm.classList.add(n) : elm.classList.remove(n)
, style: (elm, n, val) => elm.style[n] = val
}
const defaultKeys = ['props', 'dataset', 'attrs', 'class', 'style']

const updateText = (elm, v) => {
  const s = String(v)
  if (elm.textContent !== s) elm.textContent = s
  return elm
}

const createElm = (vnode, updaters={}) => {
  if (stream.isStream(vnode)) {
    let elm = document.createTextNode(vnode())
    stream.scan(updateText, elm, vnode)
    return elm
  } else if (typeof vnode !== 'object') {
    return document.createTextNode(String(vnode))
  }

  if (!vnode.tag) throw new TypeError("Uzu node must have a tag property")
  let elm = document.createElement(vnode.tag)

  const keys = Object.keys(updaters).concat(defaultKeys)
  keys.filter(k => vnode.hasOwnProperty(k)).forEach(key => {
    for (let name in vnode[key]) {
      let value = vnode[key][name]
      let updater = updaters[key] || defaultUpdaters[key]
      const update = (v) => updater(elm, name, v)
      if (stream.isStream(value)) stream.map(update, value)
      else update(value)
    }
  })
  if (vnode.children) {
    if (stream.isStream(vnode.children)) {
      stream.map(v => syncChildren(elm, v, updaters), vnode.children)
    } else {
      vnode.children.forEach(child => elm.appendChild(createElm(child, updaters)))
    }
  }
  for (let n in vnode.on || {}) elm.addEventListener(n, vnode.on[n])
  return elm
}

module.exports = createElm
