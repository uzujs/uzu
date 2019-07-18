// Demonstrating components where you can pass other components embedded in them
const { stateful, h } = require('..')

function App () {
  const body = ModalBody()
  const modal = Modal('test', body)
  return stateful({
    modal
  }, (app) => {
    return h('div', [
      app._store.modal,
      h('button', {
        on: { click: () => toggleAppModal(app) }
      }, app._store.modal._store.isOpen ? 'close modal' : 'open modal')
    ])
  })
}

// Toggle the modal and re-render the parent
function toggleAppModal (app) {
  toggleModal(app._store.modal)
  app._render()
}

// Dynamic modal body, weird contrived example
function ModalBody () {
  return stateful({
    showCounter: false,
    counter: Counter()
  }, body => {
    return h('div', [
      body._store.showCounter ? body._store.counter : 'hello world',
      h('button', {
        on: {
          click: () => {
            body._store.showCounter = !body._store.showCounter
            body._render()
          }
        }
      }, 'show/hide counter')
    ])
  })
}

// Open or close modal
function toggleModal (modal) {
  modal._store.isOpen = !modal._store.isOpen
  modal._render()
}

function Modal (title, body) {
  return stateful({
    isOpen: false,
    title,
    body
  }, (modal) => {
    return h('div', {
      style: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: modal._store.isOpen ? 'block' : 'none'
      }
    }, [
      h('h2', title),
      h('div', body)
    ])
  })
}

function Counter (start = 0) {
  return stateful({
    count: start
  }, (counter) => {
    return h('div', [
      h('button', {
        on: {
          click: () => {
            counter._store.count += 1
            counter._render()
          }
        }
      }, 'Count is ' + counter._store.count)
    ])
  })
}

const app = App()
document.body.appendChild(app.elm)
