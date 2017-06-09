const h = require('../html')
const stream = require('../stream')

// pass in a stream of arrays of strings
const dropdown = (items) => {
  const dropdowns = stream.map(itemSelect, items)
  return h('div', {}, dropdowns)
}

// pass in an array of strings
const itemSelect = (items) => {
  const itemArr = items.map(itemDiv)
  const selectedItem = stream.defaultTo(
    'Select something!'
  , stream.merge(itemArr.map(c => c.selectItem))
  )
  const itemDivs = h('div', {}, itemArr.map(i => i.elm))
  const current  = h('div', {}, h('strong', {}, selectedItem))
  return h('div', {}, [current, itemDivs])
}

const itemDiv = item => {
  const elm = h('div', {}, item)
  const selectItem = stream.always(item, stream.fromEvent('mouseover', elm))
  return {elm, selectItem}
}

const items = stream.create()
const div = dropdown(items)
items(['cupcakes', 'every', 'thursday'])
document.body.appendChild(div)
