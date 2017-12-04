const Model = require('../../model')
const html = require('bel')
const statechart = require('../../statechart')

// statechart for a single spreadsheet cell
const cellState = statechart({
  states: ['displaying', 'editing', 'hasError'],
  events: {
    ERR: ['editing', 'hasError'],
    OK: ['editing', 'displaying'],
    EDIT: [
      ['displaying', 'editing'],
      ['hasError', 'editing']
    ]
  },
  initial: {displaying: true}
})

function Cell (name) {
  return Model({
    name,
    state: cellState,
    input: null,
    output: null,
    references: [], // array of other cell names that this one references
    evaluateFn: null
  }, {
    edit: (_, c, update) => update({state: c.state.event('EDIT')}),
    evaluate: (sheet, c, update) => {
      if (c.evaluateFn) update({output: c.evaluateFn(sheet)})
    },
    setInput: (val, cell, update) => {
      if (cell.input === val) return
      update({input: val, references: []})
      if (val === '') { // blank out cell
        resetCell(update)
        return update({state: cell.state.event('OK')})
      }
      let [term1, op, term2] = val.split(/([-+/*])/).map(val => val.trim())
      op = op || 'no-op'
      if (isRef(term1)) cell.references.push(term1)
      if (isRef(term2)) cell.references.push(term2)

      if (!validateFormula(term1, op, term2)) {
        resetCell(update)
        return update({state: cell.state.event('ERR')})
      }
      const evaluateFn = (sheet) => {
        let val1 = isRef(term1) ? sheet.hash[term1].output : Number(term1)
        let val2 = isRef(term2) ? sheet.hash[term2].output : Number(term2)
        return opFunctions[op](val1, val2)
      }
      update({state: cell.state.event('OK'), evaluateFn})
    }
  })
}

const resetCell = update =>
  update({output: null, evaluateFn: null, references: []})

const opFunctions = {
  'no-op': (x) => x,
  '+': (x, y) => x + y,
  '-': (x, y) => x - y,
  '*': (x, y) => x * y,
  '/': (x, y) => x / y
}

// Validate a simple formula
// term1 must be present and either a number or reference
// term2 can be absent, or if present must be a number or ref
// op can be absent, or if present must be a key in opFunctions
const validateFormula = (term1, op, term2) => {
  return term1 && (!isNaN(term1) || isRef(term1)) &&
    (!term2 || (!isNaN(term2) || isRef(term2))) &&
    (!op || opFunctions[op])
}

const isRef = t => t && /^[A-Z]\d\d?$/.test(t)

const alphabet = 'abcdefghijklmnopqrstupvwxjz'.toUpperCase().split('') // lol

function Sheet () {
  // Generate all the cells
  // Store them in both an array of arrays to render to the view
  //   as well as a dictionary for quick reference by name
  let hash = {}
  let rows = []
  // dependents are cells that reference other cells
  // dependents example: {A1: {C1: true, D1: true}}
  // C1 and D1 have references to A1
  // when A1 updates, we need to also update C1 and D1
  let dependents = {}
  for (let i = 0; i < 99; ++i) {
    rows.push([])
    for (let j = 0; j < 26; ++j) {
      let name = alphabet[j] + String(i + 1)
      let cell = Cell(name)
      rows[i].push(cell)
      hash[name] = cell
      dependents[name] = {}
    }
  }
  return Model({rows, hash, dependents}, {
    setInput: ([cell, ev], sheet, update) => {
      const input = ev.currentTarget.value
      // Remove old references
      cell.references.forEach(name => {
        sheet.dependents[name][cell.name] = undefined
      })
      cell.actions.setInput(input)
      cell.actions.evaluate(sheet)
      if (!cell.references.length) return
      // Save new references
      cell.references.forEach(name => {
        sheet.dependents[name][cell.name] = true
      })
      // Update all other cells that reference this one
      for (let name in sheet.dependents[cell.name]) {
        let dep = sheet.hash[name]
        dep.actions.evaluate(sheet)
      }
    }
  })
}

function view (sheet) {
  const ths = alphabet.map((char, i) => html`<td>${char}</td>`)
  const rows = sheet.rows.map((row, idx) => {
    // prepend the row name to the full list of cell views
    const cols = row.map(cell => html`<td> ${cellView(cell, sheet)} </td`)
    return html`<tr> <td>${idx + 1}</td> ${cols} </tr>`
  })

  return html`
    <div>
      <p> Double click a cell to edit its value or formula </p>
      <p> Valid values are any integer </p>
      <p> Valid formulas have the format "VAL [op] VAL" where "VAL" can be an integer or the name of another cell, and "[op]" can be one of "+", "-", "/", or "*"</p>
      <table>
        <style>
          td {
            white-space: nowrap;
          }
          .output {
            display: inline-block;
            width: 60px;
            background: #efefef;
          }
          input {
            width: 60px;
            background: #efefef;
          }
          .output.error {
            background: red;
          }
        </style>

        <thead> <tr> <th></th> ${ths} </tr> </thead>
        <tbody> ${rows} </tbody>
      </table>
    </div>
  `
}

function cellView (cell, sheet) {
  // nested model to control the hiding/showing of the input and output text
  const changeInput = ev => {
    sheet.actions.setInput([cell, ev])
  }
  const doubleClick = ev => {
    cell.actions.edit()
    input.focus()
  }
  const input = html`<input type='text' onchange=${changeInput} onblur=${changeInput}>`
  const output = html`<span class='output' ondblclick=${doubleClick}></span>`

  cell.onUpdate('output', val => { output.innerHTML = val || '&nbsp;' })
  cell.onUpdate('state', s => {
    output.classList.toggle('error', Boolean(s.hasError))
    input.style.display = s.editing ? 'inline-block' : 'none'
    output.style.display = s.displaying || s.hasError ? 'inline-block' : 'none'
  })

  return html`<span> ${input} ${output} </span>`
}

document.body.appendChild(view(Sheet()))
