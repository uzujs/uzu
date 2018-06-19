const {h, component, debug} = require('..')

// Move every element in the list to their new indexes
function reorderList (elems) {
  const newArr = []
  elems.forEach(elem => {
    if (elem.newIdx !== -1) newArr[elem.newIdx] = elem
  })
  return newArr
}

function List () {
  const Elem = (id) => ({id, newIdx: id})
  return component({
    state: {
      elems: [Elem(0), Elem(1), Elem(2), Elem(3)]
    },
    on: {
      REORDER: function (_, state, emit) {
        state.elems = reorderList(state.elems)
        emit('UPDATE', state)
      }
    },
    view: function (state, emit) {
      const tbody = h('tbody', state.elems.map(elemView))
      return h('div', [
        h('p', 'Reorder elements to test efficiency of child syncing'),
        h('table', [
          h('thead', [h('tr', [h('td', 'New index')])]),
          h('tbody', tbody)
        ]),
        h('button', {on: {click: () => emit('REORDER')}}, 'Reorder')
      ])
    }
  })
}

function elemView (elem, idx) {
  const input = h('input', {
    props: {
      type: 'number',
      min: -1,
      value: idx,
      style: {width: '2rem'}
    },
    on: {
      input: ev => { elem.newIdx = Number(ev.currentTarget.value) }
    }
  })
  return h('tr', {
    key: elem.id
  }, [
    h('td', elem.id),
    h('td', ['New index: ', input])
  ])
}

const list = List()
debug(list, 'list')

document.body.appendChild(list.node)
