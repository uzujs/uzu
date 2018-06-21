const {h, component, debug} = require('../..')

let id = 1
function Person (lastName, firstName) {
  return {
    firstName, lastName, id: id++, hidden: false, selected: false
  }
}

function searchMatch (str, person) {
  // Check if the given person matches the given search string
  // Returns true if there is a match
  const fullName = person.firstName + ' ' + person.lastName
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
      people: defaultPeople,
      selectedPerson: null,
      search: ''
    },
    on: {
      SEARCH: function (str, state, emit) {
        if (str !== undefined) state.search = str
        state.people = state.people.map(person => {
          person.hidden = !searchMatch(str, person)
        })
        const selected = state.selectedPerson || {}
        // Deselect the currently selected person if they are hidden by the search
        if (selected.hidden) {
          emit('DESELECT_PERSON')
        }
      },
      CREATE: function (ev, state, emit) {
        // Create a new person from a form submit event
        const [last, first] = getNameFromForm(ev.currentTarget.form)
        if (!last.length || !first.length) return
        const newPerson = Person(last, first)
        state.people.push(newPerson)
        // Select the new person and clear out any search
        emit('SELECT_PERSON', newPerson)
        emit('SEARCH', '')
      },
      DELETE: function (ev, state, emit) {
        state.people = state.people.filter(p => p.id !== state.selectedPerson.id)
        emit('UPDATE', state.people)
        emit('DESELECT_PERSON')
      },
      SELECT_PERSON: function (person, state, emit) {
        // Select a person
        if (state.selectedPerson) {
          state.selectedPerson.selected = false
        }
        if (state.selectedPerson === person) {
          return
        }
        state.selectedPerson = person
        person.selected = true
        emit('UPDATE', state)
      },
      UPDATE_PERSON: function (ev, state, emit) {
        if (!state.selectedPerson) return
        const selected = state.selectedPerson
        const [lastName, firstName] = getNameFromForm(ev.currentTarget.form)
        selected.firstName = firstName
        selected.lastName = lastName
        emit('UPDATE', state)
        // Clear any search
        emit('SEARCH', '')
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
    h('div', state.people.map(p => personView(p, state, emit))),
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
      ])
    ])
  ])
}

function personView (person, state, emit) {
  return h('div', {
    on: {click: () => emit('SELECT_PERSON', person)},
    style: {cursor: 'pointer'},
    class: {hidden: person.hidden, selected: person.selected}
  }, [person.lastName, ', ', person.firstName])
}

const ppl = People([Person('Emil', 'Hans'), Person('Mustermann', 'Max'), Person('Tisch', 'Roman')])

document.body.appendChild(ppl.node)

// const mitt = require('mitt')
// const scopeObj = {}
// const emitters = {}
//
// // TODO add double splat if it's useful -- get or emit on all recursive scopes
//
// function emit (scope, event, data) {
//   if (!Array.isArray(scope) || !scope.length) {
//     throw new TypeError('The scope argument should be a non-empty array')
//   }
//   if (!event || !event.length) {
//     throw new TypeError('The event argument should be a non-empty string')
//   }
//   assert(scope && Array.isArray(scope) && array.length)
//   let multiple = false
//   if (hasSplat(scope)) {
//     scope = scope.slice(0, scope.length - 1)
//     multiple = true
//   }
//   let emitter = pathGet(scope, emitters)
//   if (multiple) {
//     emitter.forEach(e => e.emit(event, data))
//   } else {
//     emitter.emit(event, data)
//   }
// }
//
// function hasSplat (scope) {
//   return scope[scope.length - 1] === '*'
// }
//
// function pathGet (path, obj) {
//   const lens = obj
//   for (let i = 0; i < path.length; ++i) {
//     if (!lens[path[i]]) return null
//     lens = lens[path[i]]
//   }
//   return lens
// }
//
// function pathSet (path, val, obj) {
//   const lens = obj
//   for (let i = 0; i < path.length - 1; ++i) {
//     if (!lens[path[i]]) lens[path[i]] = {}
//     lens = lens[path[i]]
//   }
//   lens[path[path.length - 1]] = val
//   return obj
// }
//
// function get (scope) {
//   if (!Array.isArray(scope) || !scope.length) {
//     throw new TypeError('The scope argument should be a non-empty array')
//   }
//   let getMany = false
//   if (scope[scope.length - 1] === '*') {
//     getMany = true
//     scope = scope.slice(0, scope.length - 1)
//   }
//   let data = pathGet(scope, scopeObj)
//   if (getMany) {
//     return Object.values(data)
//   } else {
//     return data
//   }
// }
//
// function Component (options = {}) {
//   if (!Array.isArray(options.scope) || !options.scope.length) {
//     throw new TypeError('The .scope property should be a non-empty array')
//   }
//   const handlers = []
//   const emitter = mitt()
//   let component = {
//      state: options.state,
//      emit: emitter.emit.bind(emitter),
//      scope: options.scope
//   }
//   pathSet(scope, component.state, globalState)
//   pathSet(scope, emitter, allEmitters)
//
//   const on = options.on || {}
//   for (let eventName in on) {
//     emitter.on(eventName, function (data) {
//       const result = on[eventName](data, component)
//       if (result !== undefined) state = result
//     })
//   }
//
//   return state
// }
