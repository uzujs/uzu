const model = require('../../model')
const html = require('bel')
const dom = require('../../dom')

var uid = 0
function Person (last, first) {
  return model({
    last,
    first,
    hidden: false,
    id: uid++
  }, {
    filter: (search, person, update) => {
      const fullName = person.first + ' ' + person.last
      const idx = fullName.toLowerCase().indexOf(search.toLowerCase())
      update({hidden: idx === -1})
    },
    setName: ([last, first], _, update) => update({first, last})
  })
}

function People (defaults) {
  return model({
    arr: defaults,
    selectedID: null
  }, {
    select: (id, people, update) => {
      if (people.selectedID === id) update({selectedID: null})
      else update({selectedID: id})
    },
    filter: (search, people, update) => {
      people.arr.forEach(person => {
        person.actions.filter(search)
        if (people.selectedID === person.id && person.hidden) {
          update({selectedID: null})
        }
      })
    },
    updatePerson: (ev, people, update) => {
      const person = findPerson(people.selectedID, people.arr)
      const [last, first] = getNameFromForm(ev.currentTarget.form)
      person.actions.setName([last, first])
      people.actions.filter('')
    },
    createPerson: (ev, people, update) => {
      const [last, first] = getNameFromForm(ev.currentTarget.form)
      if (!last.length || !first.length) return
      const newPerson = Person(last, first)
      const arr = people.arr.concat([newPerson])
      update({arr, selectedID: newPerson.id})
      people.actions.filter('')
    },
    deletePerson: (_, people, update) => {
      const idx = people.arr.findIndex(p => p.id === people.selectedID)
      people.arr.splice(idx, 1)
      update({arr: people.arr, selectedID: null})
    }
  })
}

function getNameFromForm (form) {
  const first = form.querySelector('input[name="first"]').value
  const last = form.querySelector('input[name="last"]').value
  return [last, first]
}

const findPerson = (id, arr) => {
  const idx = arr.findIndex(p => p.id === id)
  return arr[idx]
}

function view (people) {
  // inputs
  const filterInput = html`<input onkeyup=${ev => people.actions.filter(ev.currentTarget.value)} type='text'>`
  const firstNameInput = html`<input type='text' name='first'>`
  const lastNameInput = html`<input type='text' name='last'>`
  // buttons
  const createBtn = html`<button type='button' onclick=${people.actions.createPerson}> Create </button>`
  const updateBtn = html`<button type='button' onclick=${people.actions.updatePerson}> Update </button>`
  const deleteBtn = html`<button type='button' onclick=${people.actions.deletePerson}> Delete </button>`
  const peopleDivs = dom.childSync({
    view: peopleDiv(people),
    container: 'div',
    model: people,
    prop: 'arr'
  })

  people.onUpdate('selectedID', id => {
    if (id !== null) {
      const person = findPerson(id, people.arr)
      firstNameInput.value = person.first
      lastNameInput.value = person.last
    } else {
      firstNameInput.value = ''
      lastNameInput.value = ''
    }
  })

  return html`
    <div>
      <div>
        Filter prefix: 
        ${filterInput}
      </div>
      <div>
        ${peopleDivs}
      </div>
      <hr>
      <form>
        <div> First name: ${firstNameInput} </div>
        <div> Last name: ${lastNameInput} </div>
        <div> ${createBtn} </div>
        <div> ${updateBtn} </div>
        <div> ${deleteBtn} </div>
      </form>
    </div>
  `
}

const peopleDiv = people => person => {
  const nameSpan = document.createElement('span')
  person.onUpdate(['first', 'last'], () => {
    nameSpan.textContent = person.last + ', ' + person.first
  })
  const select = ev => people.actions.select(person.id)
  const div = html`<div onclick=${select}> ${nameSpan} </div>`
  div.style.cursor = 'pointer'
  person.onUpdate('hidden', h => {
    div.style.display = h ? 'none' : 'block'
  })
  people.onUpdate('selectedID', id => {
    div.style.backgroundColor = (id === person.id) ? 'gray' : 'transparent'
  })
  return div
}

const ppl = People([Person('Emil', 'Hans'), Person('Mustermann', 'Max'), Person('Tisch', 'Roman')])
document.body.appendChild(view(ppl))
