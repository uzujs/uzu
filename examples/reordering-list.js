const dom = require('../dom')
const model = require('../model')
const html = require('bel')

const Elem = (id) => model({id, newIdx: id})

const List = (elems) => model({elems})

// Move every element in the list to their new indexes
function reorderList (list) {
  const newArr = []
  list.elems.forEach(elem => {
    if (elem.newIdx !== -1) newArr[elem.newIdx] = elem
  })
  list.update({elems: newArr})
}

function view () {
  const list = List([Elem(0), Elem(1), Elem(2), Elem(3)])
  const tbody = dom.childSync({
    model: list,
    key: 'elems',
    view: elemView,
    container: 'tbody'
  })
  const applyBtn = html`<button onclick=${() => reorderList(list)}> Apply </button>`

  const observer = new window.MutationObserver(function (mutations) {
    for (var mutation of mutations) {
      if (mutation.type === 'childList') {
        if (mutation.addedNodes.length) console.log('added', mutation.addedNodes.length, 'nodes')
        if (mutation.removedNodes.length) console.log('removed', mutation.removedNodes.length, 'nodes')
      }
    }
  })
  observer.observe(tbody, {childList: true})

  return html`
    <div>
      <p> Reorder elements to test dom.childSync efficiency! </p>
      <p> Check the console to a see a log of dom mutations </p>
      <table>
        <thead>
         <tr> <td>ID</td> <td>New index</td> </tr>
        </thead>
        ${tbody}
      </table>
      ${applyBtn}
    </div>
  `
}

const elemView = (elem, idx) => {
  const setNewIdx = (ev) => {
    const newIdx = Number(ev.currentTarget.value)
    elem.update({newIdx})
  }

  const input = html`<input type='number' min=-1 value=${idx.idx} style='width: 2rem;' oninput=${setNewIdx}>`
  idx.onUpdate('idx', idx => { input.value = idx })
  return html`
    <tr>
      <td>${elem.id}</td>
      <td> New index: ${input} </td>
    </tr>
  `
}

document.body.appendChild(view())
