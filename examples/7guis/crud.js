const {component, emit, get, del} = require('../../experiment')
const {render, h} = require('../../experiment-render')

var id = 0
function Person (firstName, lastName) {
  // An individual person with a name, id, and hidden state
  id += 1
  return component({
    scope: ['person', id],
    state: {id, firstName, lastName, hidden: false},
    on: {
      filter: function (str, {firstName, lastName}) {
        const name = (firstName + ' ' + lastName).toLowerCase()
        // Hide the person if they do not match the search string
        return {
          hidden: name.indexOf(str.toLowerCase()) === -1
        }
      }
    }
  })
}

// The 'people' component controls selection, search, and dispatches CRUD events
component({
  scope: ['people'],
  state: {selectedID: null},
  on: {
    search: function (str, {selectedID}) {
      emit(['person', '*'], 'filter', str)
      emit(['edit-form'], 'merge', {search: str})
      // Deselect the selected person if they are not in the search results
      if (selectedID) {
        const person = get(['person', selectedID])
        if (person.hidden) {
          emit(['people'], 'select', selectedID)
        }
      }
    },
    select: function (id, {selectedID}) {
      if (id === selectedID) {
        // Toggle off the same selection
        emit(['edit-form'], 'clear')
        return {selectedID: null}
      }
      const person = get(['person', id])
      emit(['edit-form'], 'merge', {firstName: person.firstName, lastName: person.lastName})
      return {selectedID: id}
    },
    update: function (_, {selectedID}) {
      const name = get(['edit-form'])
      emit(['person', selectedID], 'merge', name)
    },
    del: function (_, {selectedID}) {
      // Deselect the current person
      emit(['people'], 'select', selectedID)
      // Delete them from the tree
      del(['person', selectedID])
      // Clear the fields
      emit(['edit-form'], 'clear')
      // Clear any search
      emit(['people'], 'search', '')
    },
    create: function () {
      const {firstName, lastName} = get(['edit-form'])
      const person = Person(firstName, lastName)
      emit(['people'], 'select', person.id)
      emit(['people'], 'search', '')
    }
  }
})

component({
  scope: ['edit-form'],
  state: {firstName: '', lastName: ''},
  on: {
    clear: () => ({firstName: '', lastName: ''})
  }
})

function view () {
  const selectedID = get(['people']).selectedID
  const selected = get(['person', selectedID])
  const formState = get(['edit-form'])
  const people = get(['person', '*'])
  let selectedStatus
  if (selected) {
    selectedStatus = h('p', ['Selected: ', selected.firstName, ' ', selected.lastName])
  } else {
    selectedStatus = h('p', 'No-one selected')
  }
  return h('div', [
    h('div', [
      'Filter prefix: ',
      h('input', {
        props: {type: 'text'},
        on: {keyup: ev => emit(['people'], 'search', ev.currentTarget.value)}
      })
    ]),
    h('div', people.map(p => personView(p, selectedID))),
    h('hr'),
    h('form', [
      h('div', [
        selectedStatus,
        'First name: ',
        h('input', {
          props: {type: 'text', name: 'first', value: formState.firstName || ''},
          on: {change: ev => emit(['edit-form'], 'merge', {firstName: ev.currentTarget.value})}
        })
      ]),
      h('div', [
        'Last name: ',
        h('input', {
          props: {type: 'text', name: 'last', value: formState.lastName || ''},
          on: {change: ev => emit(['edit-form'], 'merge', {lastName: ev.currentTarget.value})}
        })
      ]),
      h('div', [
        h('button', {
          props: {type: 'button', disabled: selectedID},
          on: {click: () => emit(['people'], 'create')}
        }, 'Create')
      ]),
      h('div', [
        h('button', {
          props: {type: 'button', disabled: !selectedID},
          on: {click: () => emit(['people'], 'update')}
        }, 'Update')
      ]),
      h('div', [
        h('button', {
          props: {type: 'button', disabled: !selectedID},
          on: {click: () => emit(['people'], 'del')}
        }, 'Delete')
      ])
    ])
  ])
}

function personView (person, selectedID) {
  if (person.hidden) return ''
  const isSelected = selectedID === person.id
  return h('div', {
    on: {click: () => emit(['people'], 'select', person.id)},
    style: {cursor: 'pointer', background: isSelected ? 'gray' : 'transparent'}
  }, [person.lastName, ', ', person.firstName])
}

Person('Hans', 'Emil')
Person('Max', 'Mustermann')
Person('Roman', 'Tisch')

const container = document.createElement('div')
document.body.append(container)
render(container, view)
