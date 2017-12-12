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
  })
}

function People (defaults) {
  const obj = defaults.reduce((acc, p) => { acc[p.id] = p; return acc }, {})
  return model({ arr: defaults, obj, selectedID: null, search: '' })
}

function filterPerson (search, person) {
  const fullName = person.first + ' ' + person.last
  const idx = fullName.toLowerCase().indexOf(search.toLowerCase())
  person.update({hidden: idx === -1})
}

function select (id, people) {
  if (people.selectedID === id) people.update({selectedID: null})
  else people.update({selectedID: id})
}

function filter (search, people) {
  people.update({search})
  people.arr.forEach(person => {
    filterPerson(search, person)
  })
  // Deselect the currently selected person if they are hidden
  if (people.selectedID !== null) {
    const sel = people.obj[people.selectedID]
    if (sel.hidden) {
      people.update({selectedID: null})
    }
  }
}

function updatePerson (ev, people) {
  const person = people.obj[people.selectedID]
  if (!person) return
  const [last, first] = getNameFromForm(ev.currentTarget.form)
  person.update({last, first})
  filter('', people)
}

function createPerson (ev, people) {
  const [last, first] = getNameFromForm(ev.currentTarget.form)
  if (!last.length || !first.length) return
  const newPerson = Person(last, first)
  people.arr.push(newPerson)
  people.obj[newPerson.id] = newPerson
  people.update({arr: people.arr, obj: people.obj, selectedID: newPerson.id})
  filter('', people)
}

function deletePerson (people) {
  const idx = people.arr.findIndex(p => p.id === people.selectedID)
  people.arr.splice(idx, 1)
  delete people.obj[people.selectedID]
  people.update({arr: people.arr, obj: people.obj, selectedID: null})
}

function getNameFromForm (form) {
  const first = form.querySelector('input[name="first"]').value
  const last = form.querySelector('input[name="last"]').value
  return [last, first]
}

function view (people) {
  // inputs
  const filterInput = html`<input onkeyup=${ev => filter(ev.currentTarget.value, people)} type='text'>`
  const firstNameInput = html`<input type='text' name='first'>`
  const lastNameInput = html`<input type='text' name='last'>`
  // buttons
  const createBtn = html`<button type='button' onclick=${ev => createPerson(ev, people)}> Create </button>`
  const updateBtn = html`<button type='button' onclick=${ev => updatePerson(ev, people)}> Update </button>`
  const deleteBtn = html`<button type='button' onclick=${() => deletePerson(people)}> Delete </button>`
  const peopleDivs = dom.childSync({
    view: peopleDiv(people),
    model: people,
    key: 'arr'
  })

  people.onUpdate('search', s => { filterInput.value = s })
  people.onUpdate('selectedID', id => {
    if (id !== null) {
      const person = people.obj[id]
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
  const div = html`<div onclick=${() => select(person.id, people)}> ${nameSpan} </div>`
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
