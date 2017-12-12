const model = require('../model')
const dom = require('../dom')
const html = require('bel')

// Contrived example to show the dom.route function

function view () {
  const tabModel = model({page: 'a'})
  const tabs = dom.route({
    model: tabModel,
    key: 'page',
    routes: {
      a: viewA(tabModel),
      b: viewB(tabModel),
      c: viewC(tabModel)
    }
  })

  return html`
    <div>
      <p> Tab demo using dom.route </p>
      ${tabs}
    </div>
  `
}

function navBtn (tabModel, name) {
  tabModel.onUpdate('page', p => console.log(`page changed to ${p} from btn ${name}`))
  return html`<button onclick=${ev => tabModel.update({page: name})}> Show view ${name} </button>`
}

const viewA = tabModel => () => {
  return html`<p> Welcome to View A. ${navBtn(tabModel, 'b')} </p>`
}

const viewB = tabModel => () =>
  html`<p> Hello from View B. ${navBtn(tabModel, 'c')} </p>`

const viewC = tabModel => () =>
  html`<p> Buenos dias, esto pagina es vista C. ${navBtn(tabModel, 'a')} </p>`

document.body.appendChild(view())
