const channel = require('../../channel')
const html = require('bel')
const dom = require('../../dom')

var uid = 0
function Person (last, first) {
  return {
    last: channel(last),
    first: channel(first),
    hidden: channel(false),
    id: uid++
  }
}

function People (defaults) {
  const obj = defaults.reduce((acc, p) => { acc[p.id] = p; return acc }, {})
  return { arr: channel(defaults), obj: obj, selectedID: channel(null), search: channel('') }
}

function filterPerson (search, person) {
  const fullName = person.first.value + ' ' + person.last.value
  const idx = fullName.toLowerCase().indexOf(search.toLowerCase())
  person.hidden.send(idx === -1)
}

function select (id, people) {
  if (people.selectedID.value === id) people.selectedID.send(null)
  else people.selectedID.send(id)
}

function filter (search, people) {
  people.search.send(search)
  console.log('people', people)
  people.arr.value.forEach(person => {
    filterPerson(search, person)
  })
  // Deselect the currently selected person if they are hidden
  if (people.selectedID.value !== null) {
    const sel = people.obj[people.selectedID.value]
    if (sel.hidden.value) {
      people.selectedID.send(null)
    }
  }
}

function updatePerson (ev, people) {
  const person = people.obj[people.selectedID.value]
  if (!person) return
  const [last, first] = getNameFromForm(ev.currentTarget.form)
  person.last.send(last)
  person.first.send(first)
  filter('', people)
}

function createPerson (ev, people) {
  const [last, first] = getNameFromForm(ev.currentTarget.form)
  if (!last.length || !first.length) return
  const newPerson = Person(last, first)
  people.arr.value.push(newPerson)
  people.arr.send(people.arr.value)
  people.obj[newPerson.id] = newPerson
  people.selectedID.send(newPerson.id)
  filter('', people)
}

function deletePerson (people) {
  const idx = people.arr.findIndex(p => p.id === people.selectedID)
  people.arr.splice(idx, 1)
  delete people.obj[people.selectedID]
  people.arr.send(people.arr)
  people.selectedID.send(null)
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
    channel: people.arr
  })

  people.search.listen(s => { filterInput.value = s })
  people.selectedID.listen(id => {
    if (id !== null) {
      const person = people.obj[id]
      firstNameInput.value = person.first.value
      lastNameInput.value = person.last.value
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
  const firstNameSpan = document.createElement('span')
  const lastNameSpan = document.createElement('span')
  const nameSpan = html`<span> ${lastNameSpan}, ${firstNameSpan} </span>`
  person.first.listen(str => { firstNameSpan.textContent = str })
  person.last.listen(str => { lastNameSpan.textContent = str })

  const div = html`<div onclick=${() => select(person.id, people)}> ${nameSpan} </div>`
  div.style.cursor = 'pointer'
  person.hidden.listen(h => {
    div.style.display = h ? 'none' : 'block'
  })
  people.selectedID.listen(id => {
    div.style.backgroundColor = (id === person.id) ? 'gray' : 'transparent'
  })
  return div
}

const ppl = People([Person('Emil', 'Hans'), Person('Mustermann', 'Max'), Person('Tisch', 'Roman')])
document.body.appendChild(view(ppl))
