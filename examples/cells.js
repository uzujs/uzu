const createElm = require('../html')
const stream = require('../stream')
const R = require('ramda')

const width = 4
const height = 20

// Some default cell values
const initial = R.repeat(R.repeat('', width), height)

// Top-level DOM generator function
const view = (sheet) => ({
    tag: 'div'
  , children: [
      {tag: 'p', children: ['Below is a simple spreadsheet. Cells can contain plain values or javascript expressions that refer to other cells.']}
    , {tag: 'p', children: ['If a cell has a number format it will be interpreted as a number, and otherwise as a string.']}
    , table(sheet)
    ]
  })

// Generate the dom for the spreadsheet's table
// Sheet is a stream of matrixes of cell values
const table = (spreadSheet) => {
  const th = n => ({tag: 'th', children: [n]})
  // Take each output from the spreadSheet model and create a row of values
  const rows = stream.map(sheet => sheet.values.map(makeRow(spreadSheet)), spreadSheet.output)
  return {
    tag: 'table'
  , children: [
      {tag: 'thead', children: [{tag: 'tr', children: [th(''), th('A'), th('B'), th('C'), th('D')]}]}
    , {tag: 'tbody', children: rows}
   ]
  }
}

// Given a sheet (output from SpreadSheet model), a row of values, and the index of that row
// Then return a table row of the formula input, value, and handle change events
const makeRow = spreadSheet => (row, rowIdx) =>
  ({
    tag: 'tr'
  , children: []
  })

// A single cell with input and value
const td = (spreadSheet, val, rowIdx, colIdx) => ({
  tag: 'td'
, children: [
    {tag: 'input', on: {change: ev => spreadSheet.input.change([ev.currentTarget.value, rowIdx, colIdx])}}
  , {tag: 'span', children: ['val']}
  , {tag: 'input', props: {type: 'checkbox'}}
  ]
})

// -- UI Logic below

// The `sheet` object has properties:
//   formulas: an nxn matrix of arrays of javascript string formulas
//   values: an nxn matrix of evaluated values in the spreadsheet -- corresponds to formulas matrix
//   references: an object that tracks which cells reference which other cells

// SpreadSheet model
const SpreadSheet = initial => ({change}) => {
  // Create an initial sheet of default values
  const initialSheet = {formulas: R.clone(initial), values: R.clone(initial), references: {}}
  // Update the sheet on every change to any input
  return stream.scan(updateSheet, initialSheet, change)
}

// Given a sheet object (see description above), a newly entered formula and row*col coordinates
// Then update the sheet's values based on the new formula
const updateSheet = (sheet, [formula, row, col]) => {
  const oldRefs = findRefs(sheet.formulas[row][col] || '')
  const refs = findRefs(formula)
  sheet.values = R.update(row, R.update(col, formula, sheet.values[row]), sheet.values) 
  return sheet
}

// Find references to other cells in an expression
const refRegex = /[A-Z][1-9]([1-9])?/g
const findRefs = R.match(refRegex)

const render = () => {
  const model = stream.model(SpreadSheet(initial))
  const vnode = view(model)
  const div = createElm(vnode)
  document.body.appendChild(div)
}
render()
