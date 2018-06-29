const {h, component, debug} = require('../..')

let id = 0
function Person (name) {
  id += 1
  return component({
    state: {
      firstName: name.firstName,
      lastName: name.lastName,
      id: id,
      selected: false,
      hidden: false
    },
    on: {
      select: (_, {selected}) => ({selected: !selected}),
      deselect: () => ({selected: false}),
      filter: (str, state) => {
        const name = (state.firstName + ' ' + state.lastName).toLowerCase()
        const hidden = name.indexOf(str.toLowerCase()) === -1
        if (hidden && state.selected) {
          // Deselect them if they are hidden from search
          return {hidden, selected: false}
        } else {
          return {hidden}
        }
      },
      updateName: ({firstName, lastName}) => {
        if (!firstName || !lastName) return
        return {firstName, lastName}
      }
    },
    view: function (state, emit) {
      return h('div', {
        key: state.id,
        style: {
          background: state.selected ? 'grey' : 'transparent',
          cursor: 'pointer',
          display: state.hidden ? 'none' : 'block'
        },
        on: {click: () => emit('select')}
      }, [
        state.lastName, ', ', state.firstName
      ])
    }
  })
}

function PersonForm () {
  // Shows a form for a person's name
  // Tracks a selected person
  return component({
    state: {selectedPerson: null, name: {firstName: '', lastName: ''}},
    on: {
      setPerson: person => {
        let firstName = ''
        let lastName = ''
        if (person !== null) {
          firstName = person.state.firstName
          lastName = person.state.lastName
        }
        return {
          selectedPerson: person,
          name: {firstName, lastName}
        }
      },
      // Merge a new name into state.name
      setName: (name, state) => ({name: Object.assign(state.name, name)})
    },
    view: function (state, emit) {
      return h('div', [
        h('input', {
          props: {type: 'text', placeholder: 'First name', value: state.name.firstName},
          on: {
            input: ev => emit('setName', {firstName: ev.currentTarget.value})
          }
        }),
        h('input', {
          props: {type: 'text', placeholder: 'Last name', value: state.name.lastName},
          on: {
            input: ev => emit('setName', {lastName: ev.currentTarget.value})
          }
        })
      ])
    }
  })
}

function People () {
  const p1 = Person({firstName: 'Max', lastName: 'Mustermann'})
  const p2 = Person({firstName: 'Roman', lastName: 'Tisch'})
  const p3 = Person({firstName: 'Hans', lastName: 'Emil'})
  const form = PersonForm()
  return component({
    state: {people: [p1, p2, p3], form},
    on: {
      select: function (person, state) {
        // We add an extra event wrapper to toggle off the selection from other people
        state.people.filter(p => p.state.id !== person.state.id && p.state.selected)
          .forEach(p => p.emit('deselect'))
        if (person.state.selected) {
          // Set the name in the form
          state.form.emit('setPerson', person)
        } else {
          // Clear the name from the form
          state.form.emit('setPerson', null)
        }
      },
      filter: function (str, state) {
        state.people.forEach(p => p.emit('filter', str))
      },
      update: function (_, state) {
        const person = state.form.state.selectedPerson
        person.emit('updateName', state.form.state.name)
      },
      del: function (_, state) {
        const person = state.form.state.selectedPerson
        const people = state.people.filter(p => p.state.id !== person.state.id)
        return {people}
      },
      create: function (_, state) {
        const name = state.form.state.name
        if (!name.firstName || !name.lastName) return
        const person = Person(name)
        const people = state.people.concat([person])
        return {people}
      }
    },
    view: function (state, emit) {
      return h('div', [
        h('div', [
          h('input', {
            props: {type: 'text', placeholder: 'Filter people'},
            on: {
              input: ev => emit('filter', ev.currentTarget.value)
            }
          })
        ]),
        h('div', state.people.map(p => {
          return h('div', {
            key: p.state.id,
            on: {click: () => emit('select', p)}
          }, [ p.vnode ])
        })),
        h('div', [ form.vnode ]),
        h('div', [
          h('button', {on: {click: () => emit('create')}}, 'Create'),
          h('button', {
            on: {click: () => emit('update')},
            props: {disabled: !state.form.state.selectedPerson}
          }, 'Update'),
          h('button', {
            on: {click: () => emit('del')},
            props: {disabled: !state.form.state.selectedPerson}
          }, 'Delete')
        ])
      ])
    }
  })
}

const p1 = People()

document.body.appendChild(p1.node)
