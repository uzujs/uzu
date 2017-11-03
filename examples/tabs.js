const state = require('../')
const dom = require('../dom')
const html = require('bel')

// Contrived example to show the dom.route function

function view () {
  const tabState = state({page: 'a'})
  const tabs = dom.route({
    state: tabState,
    prop: 'page',
    container: 'div',
    routes: {
      a: viewA(tabState),
      b: viewB(tabState),
      c: viewC(tabState)
    }
  })

  return html`
    <div>
      <p> Tab demo using dom.route </p>
      ${tabs}
    </div>
  `
}

function navBtn (tabState, name) {
  tabState.on('page', p => console.log(`page changed to ${p} from btn ${name}`))
  return html`<button onclick=${ev => tabState.update({page: name})}> Show view ${name} </button>`
}

const viewA = tabState => () => {
  return html`<p> Welcome to View A. ${navBtn(tabState, 'b')} </p>`
}

const viewB = tabState => () =>
  html`<p> Hello from View B. ${navBtn(tabState, 'c')} </p>`

const viewC = tabState => () =>
  html`<p> Buenos dias, esto pagina es vista C. ${navBtn(tabState, 'a')} </p>`

document.body.appendChild(view())
