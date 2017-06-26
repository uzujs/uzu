const createElm = require('../html')
const stream = require('../stream')

const Hoverer = ({hover}) => 
  stream.defaultTo('hover time!', stream.map(ev => ev.target.textContent, hover))

const view = (hoverer) => {
  const p = n => ({tag: 'p', children: [n], on: {mouseover: hoverer.input.hover}})
  return {
    tag: 'div'
  , children: [
      {tag: 'p', style: {fontWeight: 'bold'}, children: [ hoverer.output ]}
    , p('cupcakes')
    , p('every')
    , p('thursday')
    ]
  }
}
  
const vnode = view(stream.model(Hoverer))
const elm = createElm(vnode)
document.body.appendChild(elm)
