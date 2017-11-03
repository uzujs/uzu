const state = require('../../index')
const html = require('bel')
const dom = require('../../dom')

window.state = state

var uid = 0
function Person (last, first) {
  return state({
    last,
    first,
    hidden: false,
    id: uid++
  })
}

function searchPerson (search, person, people) {
  const fullName = person.first + ' ' + person.last
  const idx = fullName.toLowerCase().indexOf(search.toLowerCase())
  person.update({hidden: idx === -1})
  if (people.selected === person.id && person.hidden) {
    people.update({selected: null})
  }
}

function People (defaults) {
  return state({
    arr: defaults,
    selected: null,
    currentSearch: ''
  })
}

const filterPeople = (people, search) => {
  people.update({currentSearch: search})
  people.arr.forEach(p => searchPerson(search, p, people))
}
const filterPeopleFromEvent = people => ev => {
  const search = ev.currentTarget.value
  filterPeople(people, search)
}

function getNameFromForm (form) {
  const first = form.querySelector('input[name="first"]').value
  const last = form.querySelector('input[name="last"]').value
  return [last, first]
}

const updatePerson = people => ev => {
  const person = findPerson(people.selected, people)
  const [last, first] = getNameFromForm(ev.currentTarget.form)
  person.update({last, first})
  searchPerson(people.currentSearch, person, people)
}

const findPerson = (id, people) => {
  const idx = people.arr.findIndex(p => p.id === id)
  return people.arr[idx]
}

const createPerson = people => ev => {
  const [last, first] = getNameFromForm(ev.currentTarget.form)
  if (!last.length || !first.length) return
  const newPerson = Person(last, first)
  const arr = people.arr.concat([newPerson])
  people.update({arr, selected: newPerson.id})
  if (people.currentSearch) {
    searchPerson(people.currentSearch, newPerson, people)
    // If you just create someone, and they're not in the search results, then clear the search
    if (newPerson.hidden) {
      filterPeople(people, '')
    }
  }
}

const deletePerson = people => ev => {
  const idx = people.arr.findIndex(p => p.id === people.selected)
  people.arr.splice(idx, 1)
  people.update({arr: people.arr, selected: null})
}

function view (people) {
  // inputs
  const filterInput = html`<input onkeyup=${filterPeopleFromEvent(people)} type='text'>`
  const firstNameInput = html`<input type='text' name='first'>`
  const lastNameInput = html`<input type='text' name='last'>`
  // buttons
  const createBtn = html`<button type='button' onclick=${createPerson(people)}> Create </button>`
  const updateBtn = html`<button type='button' onclick=${updatePerson(people)}> Update </button>`
  const deleteBtn = html`<button type='button' onclick=${deletePerson(people)}> Delete </button>`

  const peopleDivs = dom.childSync({
    view: peopleDiv(people),
    container: 'div',
    state: people,
    prop: 'arr'
  })

  people.on('currentSearch', s => { filterInput.value = s })

  people.on('selected', id => {
    if (id !== null) {
      const person = findPerson(id, people)
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
  person.on(['first', 'last'], () => {
    nameSpan.textContent = person.last + ', ' + person.first
  })
  const select = ev => people.update({selected: people.selected === person.id ? null : person.id})
  const div = html`<div onclick=${select}> ${nameSpan} </div>`
  div.style.cursor = 'pointer'
  person.on('hidden', h => {
    div.style.display = h ? 'none' : 'block'
  })
  people.on('selected', id => {
    div.style.backgroundColor = (id === person.id) ? 'gray' : 'transparent'
  })
  return div
}

const ppl = People([Person('Emil', 'Hans'), Person('Mustermann', 'Max'), Person('Tisch', 'Roman')])
document.body.appendChild(view(ppl))
