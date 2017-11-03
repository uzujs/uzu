const state = require('../../index')
const html = require('bel')

function Cell (name) {
  return state({
    name,
    input: null,
    output: null,
    deps: [],
    error: false,
    formulaFn: null
  })
}

const opFunctions = {
  '+': (x, y) => x + y,
  '-': (x, y) => x - y,
  '*': (x, y) => x * y,
  '/': (x, y) => x / y
}

// set a cell to have an error state: no output, no deps, etc
const setErr = (cell) => cell.update({error: true, input: '', output: null, deps: []})

// Check if a term in a cell formula is valid
const validTerm = (term) => {
  if (isNaN(term)) {
    return /^[A-Z]\d\d?$/.test(term)
  } else return true
}

function setInput (val, cell, sheet) {
  cell.update({error: false}) // get rid of any error state right away
  if (val === '') { // cleared out a cell to be blank
    cell.update({input: '', output: null, formulaFn: null, deps: []})
    return
  }

  // Split the input by a possible operator -- will have length one if 'TERM' or length three if 'TERM OP TERM'
  const tokens = val.split(/([-+/*])/).map(val => val.trim())
  // Save a reference the cell's current dependents for later
  const oldDeps = cell.deps

  if (tokens.length === 1) {
    // Single term
    if (!validTerm(tokens[0])) {
      setErr(cell)
    } else {
      const term = tokens[0]
      const deps = isNaN(term) ? [term] : []
      // function to store to compute the output from the sheet's dictionary of cells
      const formulaFn = (cells) => cell.update({output: isNaN(term) ? sheet.dict[term].output : Number(term)})
      cell.update({input: val, formulaFn, deps})
      formulaFn(sheet.dict) // compute the output right away
    }
  } else if (tokens.length === 3) {
    // expression like TERM OP TERM
    const [term1, op, term2] = tokens
    if (!validTerm(term1) || !validTerm(term2)) {
      setErr(cell)
    } else {
      const deps = []
      if (isNaN(term1)) deps.push(term1)
      if (isNaN(term2)) deps.push(term2)
      // function to store to compute the output from the sheet's dictionary of cells
      const formulaFn = (cells) => {
        const t1 = isNaN(term1) ? cells[term1].output : Number(term1)
        const t2 = isNaN(term2) ? cells[term2].output : Number(term2)
        cell.update({output: opFunctions[op](t1, t2)})
      }
      cell.update({input: val, formulaFn, deps})
      formulaFn(sheet.dict) // compute the output right away
    }
  } else {
    // tokens length must be 1 or 3 for a valid expression
    setErr(cell)
  }

  // Now that the cell has new dependents, we can set the sheet's .dependents object
  // Remove old dependents and set new ones
  oldDeps.forEach(name => {
    sheet.dependents[name] = sheet.dependents[name].filter(c => c !== cell)
  })
  cell.deps.forEach(name => {
    sheet.dependents[name] = sheet.dependents[name] || []
    sheet.dependents[name].push(cell)
  })
  sheet.update({dependents: sheet.dependents})
  // Now that all the dependents are set, and the cell has a new value, we can re-calculate values for all cells that depend on this one
  sheet.dependents[cell.name].forEach(c => {
    c.formulaFn(sheet.dict) // will recalculate output for c
  })
}

const alphabet = 'abcdefghijklmnopqrstupvwxjz'.toUpperCase().split('') // lol

function Sheet () {
  // Generate all the cells
  // Store them in both an array of arrays to render to the view
  //   as well as a dictionary for quick reference by name
  let dict = {}
  let rows = []
  // dependents keeps track of what cells depend on what others:
  //    values are cell names
  //    keys are arrays of other cells
  //    (this says cell name XY *is referenced in* all the cells in the array
  let dependents = {}
  for (let i = 0; i < 99; ++i) {
    rows.push([])
    for (let j = 0; j < 26; ++j) {
      let name = alphabet[j] + String(i + 1)
      let cell = Cell(name)
      rows[i].push(cell)
      dict[name] = cell
      dependents[name] = []
    }
  }
  return state({ rows, dict, dependents })
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
            width: 60px;
            background: #efefef;
          }
          input {
            width: 60px;
            background: #efefef;
          }
          .output.error {
            border: 1px solid red;
          }
        </style>

        <thead> <tr> <th></th> ${ths} </tr> </thead>
        <tbody> ${rows} </tbody>
      </table>
    </div>
  `
}

function cellView (cell, sheet) {
  // nested state to control the hiding/showing of the input and output text
  const toggleHide = state({hidden: true})
  const changeInput = ev => {
    setInput(ev.currentTarget.value, cell, sheet)
    toggleHide.update({hidden: true}) // hide the input, show the output
  }
  const doubleClick = ev => {
    toggleHide.update({hidden: false}) // show the input, hide the output
    input.focus()
  }
  const input = html`<input type='text' onchange=${changeInput} onblur=${changeInput}>`
  const output = html`<span class='output' ondblclick=${doubleClick}></span>`

  cell.on('output', val => { output.innerHTML = val || '&nbsp;' })
  cell.on('error', err => {
    if (err) {
      output.classList.add('error')
      output.textContent = 'error'
    } else {
      output.classList.remove('error')
    }
  })

  toggleHide.on('hidden', hideInput => {
    input.style.display = hideInput ? 'none' : 'block'
    output.style.display = hideInput ? 'block' : 'none'
  })
  return html`<span> ${input} ${output} </span>`
}

document.body.appendChild(view(Sheet()))
