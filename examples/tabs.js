const channel = require('../channel')
const dom = require('../dom')
const html = require('bel')

// Contrived example to show the dom.route function

function view () {
  const page = channel('a')
  const tabs = dom.route({
    channel: page,
    routes: {
      a: viewA(page),
      b: viewB(page),
      c: viewC(page)
    }
  })

  return html`
    <div>
      <p> Tab demo using dom.route </p>
      ${tabs}
    </div>
  `
}

function navBtn (page, name) {
  page.listen(p => console.log(`page changed to ${p} from btn ${name}`))
  return html`<button onclick=${ev => page.send(name)}> Show view ${name} </button>`
}

const viewA = page => () => {
  return html`<p> Welcome to View A. ${navBtn(page, 'b')} </p>`
}

const viewB = page => () =>
  html`<p> Hello from View B. ${navBtn(page, 'c')} </p>`

const viewC = page => () =>
  html`<p> Buenos dias, esto pagina es vista C. ${navBtn(page, 'a')} </p>`

document.body.appendChild(view())
