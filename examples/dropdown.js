const {elm, transform} = require('../html')
const stream = require('stream')

const hoverer = ({hover}) => {
  return stream.map(ev => ev.target.textContent, hover)
}

const div = tranform({value: x}, child('div'))

const transform = (rules, childFn, container) => {
  applyRlues(childFn(container))
}

const appendChild = (tagname, container) =>
  container.appendChild(document.createElement(tagname))

const view = (hoverer, container) => {
  
  const div = h('div', [elm('p', ['cupcakes']), elm('p', ['every']), elm('p', ['thursday'])])
  const hovered = model(div)
  
}

view(document.body)
