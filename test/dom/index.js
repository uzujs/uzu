const html = require('bel')
const model = require('../../model')
const dom = require('../../dom')
const test = require('tape')

var id = 0
function Elem (name) {
  return model({name: name, id: id++})
}
function List (elems) {
  return model({elems: elems || []})
}

function childView (elem, idx) {
  const span = document.createElement('span')
  elem.on('name', n => { span.textContent = n })
  return html`<li> ${span} </li>`
}

function listView (list) {
  return dom.childSync({
    view: childView,
    container: 'ul',
    model: list,
    prop: 'elems'
  })
}

// childSync

test('childSync appends, removes, and reorders children', t => {
  const [a, b, c, d] = [Elem('a'), Elem('b'), Elem('c'), Elem('d')]
  const list = List([a, b, c])
  const ul = listView(list)
  t.strictEqual(ul.children.length, 3, 'has three children for each elem')
  t.strictEqual(ul.textContent.replace(/\s/g, ''), 'abc', 'has text content of all child views')
  // Append a new child
  list.elems.push(d)
  list.update({elems: list.elems})
  t.strictEqual(ul.children.length, 4, 'has four elems after the append')
  t.strictEqual(ul.textContent.replace(/\s/g, ''), 'abcd', 'has text content of fourth view')
  // Remove a middle child
  list.elems.splice(1, 1)
  list.update({elems: list.elems})
  t.strictEqual(ul.children.length, 3, 'correct number of children after remove')
  t.strictEqual(ul.textContent.replace(/\s/g, ''), 'acd', 'correct text content after remove')
  // listener on b removed
  t.strictEqual(Object.keys(b._emitter._events).length, 0)
  // Reorder
  const firstChild = ul.children[0]
  const secondChild = ul.children[1]
  const swap = list.elems[0]
  list.elems[0] = list.elems[1]
  list.elems[1] = swap
  list.update({elems: list.elems})
  t.strictEqual(ul.children.length, 3, 'correct number of children after reorder')
  t.strictEqual(ul.textContent.replace(/\s/g, ''), 'cad', 'correct text content')
  t.strictEqual(firstChild, ul.children[1], 'swapped elems are the same as before')
  t.strictEqual(secondChild, ul.children[0], 'swapped elems are the same as before')
  // Remove last child
  list.elems.splice(2, 1)
  list.update({elems: list.elems})
  t.strictEqual(ul.textContent.replace(/\s/g, ''), 'ca', 'correct text content')
  t.strictEqual(Object.keys(d._emitter._events).length, 0, 'listener removed')
  // Remove first child
  list.elems.splice(0, 1)
  list.update({elems: list.elems})
  t.strictEqual(ul.textContent.replace(/\s/g, ''), 'a', 'correct text content')
  t.strictEqual(Object.keys(c._emitter._events).length, 0, 'listener removed')
  // Replace array
  list.update({elems: []})
  t.strictEqual(ul.textContent.replace(/\s/g, ''), '', 'correct text content')
  t.strictEqual(Object.keys(a._emitter._events).length, 0, 'listener removed')
  t.end()
})

// route

function Router (p) {
  return model({page: p})
}

function routeView (router) {
  var childView = name => () => {
    router.on('page', () => { 'listening' })
    return html` <p> ${name} </p> `
  }
  return dom.route({
    model: router,
    prop: 'page',
    container: 'div',
    routes: {
      a: childView('a'),
      b: childView('b'),
      c: childView('c')
    }
  })
}

test('route container always has correct the active child', t => {
  const router = Router('a')
  const emitter = router._emitter
  const div = routeView(router)
  t.strictEqual(div.children.length, 1, 'has only one child for viewA')
  t.strictEqual(div.textContent.replace(/\s/g, ''), 'a', 'has viewA content')
  // One listeners for dom.route, plus one listener in the child view
  t.strictEqual(emitter._events['update:page'].length, 2, 'correct number of listeners')
  router.update({page: 'b'})
  t.strictEqual(div.children.length, 1, 'has only one child for viewB')
  t.strictEqual(div.textContent.replace(/\s/g, ''), 'b', 'has viewB content')
  t.strictEqual(emitter._events['update:page'].length, 2, 'correct number of listeners')
  router.update({page: 'c'})
  t.strictEqual(div.children.length, 1, 'has only one child for viewC')
  t.strictEqual(div.textContent.replace(/\s/g, ''), 'c', 'has viewC content')
  t.strictEqual(emitter._events['update:page'].length, 2, 'correct number of listeners')
  t.end()
})
