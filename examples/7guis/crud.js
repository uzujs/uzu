const {h, component, debug} = require('../..')

let id = 1
function Person (lastName, firstName) {
  return component({
    state: {lastName, firstName, id: id++, hidden: false, selected: false},
    on: {
      SEARCH: function (str, state, emit) {
        state.hidden = !searchMatch(str, state)
        emit('UPDATE', state)
      }
    },
    view: function (state, emit) {
      return h('div', {
        on: {click: () => emit('SELECT')},
        style: {cursor: 'pointer'},
        class: {hidden: state.hidden, selected: state.selected}
      }, [state.lastName, ', ', state.firstName])
    }
  })
}

function searchMatch (str, state) {
  // Check if the given person matches the given search string
  // Returns true if there is a match
  const fullName = state.firstName + ' ' + state.lastName
  const idx = fullName.toLowerCase().indexOf(str.toLowerCase())
  return idx !== -1
}

function getNameFromForm (form) {
  const first = form.querySelector('input[name="first"]').value
  const last = form.querySelector('input[name="last"]').value
  return [last, first]
}

function People (defaultPeople = []) {
  const people = component({
    state: {
      people: [],
      selectedPerson: {},
      search: ''
    },
    on: {
      SEARCH: function (s, state, emit) {
        if (s !== undefined) state.search = s
        state.people.forEach(p => p.emit('SEARCH', state.search))
        const selected = state.selectedPerson.state || {}
        // Deselect the currently selected person if they are hidden by the search
        if (selected.hidden) {
          state.selectedPerson = {}
          state.search = ''
          emit('UPDATE', state)
        }
      },
      CREATE: function (ev, state, emit) {
        const [last, first] = getNameFromForm(ev.currentTarget.form)
        if (!last.length || !first.length) return
        const newPerson = Person(last, first)
        emit('ADD_PERSON', newPerson)
        // Select the new person and clear out any search
        state.selectedPerson = newPerson
        state.search = ''
        emit('SEARCH')
      },
      ADD_PERSON: function (newPerson, state, emit) {
        // Append a person component to the .people array
        debug(newPerson, 'person' + newPerson.state.id)
        newPerson.on('SELECT', () => {
          // Deselect any previously selected people
          state.people.filter(p => p.state.selected).forEach(p => {
            p.state.selected = false
            p.emit('UPDATE', p.state)
          })
          if (state.selectedPerson === newPerson) {
            // Deselect a previously selected person
            state.selectedPerson = {}
          } else {
            // Select a new person
            newPerson.state.selected = true
            newPerson.emit('UPDATE', newPerson.state)
            state.selectedPerson = newPerson
          }
          emit('UPDATE', state)
        })
        state.people.push(newPerson)
        emit('UPDATE', state)
      },
      DELETE: function (ev, state, emit) {
        const idx = state.people.findIndex(p => p.id === state.selectedPerson.state.id)
        state.people.splice(idx, 1)
        state.selectedPerson = {}
        emit('UPDATE', state)
      },
      UPDATE_PERSON: function (ev, state, emit) {
        if (!state.selectedPerson.state.id) return
        const [last, first] = getNameFromForm(ev.currentTarget.form)
        selectedPerson.state.firstName = first
        selectedPerson.state.lastName = last
        selectedPerson.emit('UPDATE', selectedPerson.state)
        state.search = ''
        emit('SEARCH')
      }
    },
    view: peopleView
  })
  defaultPeople.forEach(p => people.emit('ADD_PERSON', p))
  return people
}

function peopleView (state, emit) {
  const selected = state.selectedPerson.state || {}
  return h('div', [
    h('style', {
      props: {innerHTML: '.hidden {display: none;} .selected {background: grey;}'}
    }),
    h('div', [
      'Filter prefix: ',
      h('input', {
        props: {type: 'text', value: state.search},
        on: {keyup: ev => emit('SEARCH', ev.currentTarget.value)}
      })
    ]),
    h('div', state.people.map(p => p.vnode)),
    h('hr'),
    h('form', [
      h('div', [
        'First name: ',
        h('input', {
          props: {type: 'text', name: 'first', value: selected.firstName || ''}
        })
      ]),
      h('div', [
        'Last name: ',
        h('input', {
          props: {type: 'text', name: 'last', value: selected.lastName || ''}
        })
      ]),
      h('div', [
        h('button', {props: {type: 'button'}, on: {click: ev => emit('CREATE', ev)}}, 'Create')
      ]),
      h('div', [
        h('button', {props: {type: 'button'}, on: {click: ev => emit('UPDATE_PERSON', ev)}}, 'Update')
      ]),
    ])
  ])
}

const ppl = People([Person('Emil', 'Hans'), Person('Mustermann', 'Max'), Person('Tisch', 'Roman')])
debug(ppl, 'people')

document.body.appendChild(ppl.node)
