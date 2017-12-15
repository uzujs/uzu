const html = require('bel')
const channel = require('../channel')
const statechart = require('../statechart')
const dom = require('../dom')

const searchState = statechart({
  states: ['loading', 'hasResults', 'noResults'],
  events: {
    SEARCH: [['hasResults', 'loading'], ['noResults', 'loading']],
    GOT_RESULTS: ['loading', 'hasResults'],
    NO_RESULTS: ['loading', 'noResults']
  },
  initial: {noResults: true}
})

const WikiSearch = () => {
  return {
    results: channel([]),
    state: channel(searchState)
  }
}

const urlStr = 'https://en.wikipedia.org/w/api.php?action=query&format=json&gsrlimit=20&generator=search&origin=*&gsrsearch='

const performSearch = model => event => {
  const searchStr = event.currentTarget.value
  if (!searchStr.length) return
  model.state.send(model.state.value.event('SEARCH'))
  window.fetch(urlStr + searchStr, {mode: 'cors'})
    .then(res => res.json())
    .then(data => {
      if (!data.query) {
        model.state.send(model.state.value.event('NO_RESULTS'))
        model.results.send([])
      } else {
        // Assign id properties to each result object
        // convert an object where the keys are ids
        // into an array of objects that each have an id prop
        let arr = []
        for (let id in data.query.pages) {
          let page = data.query.pages[id]
          page.id = page.pageid
          arr.push(page)
        }
        model.state.send(model.state.value.event('GOT_RESULTS'))
        model.results.send(arr)
      }
    })
}

const view = () => {
  const wikiSearch = WikiSearch()
  const searchInput = html`<input type='text' onchange=${performSearch(wikiSearch)} placeholder='Search Wikipedia'>`
  const loadingMsg = html`<p> Loading... </p>`
  const noResults = html`<p> No results yet.. </p>`
  const rows = dom.childSync({
    view: rowView,
    container: 'tbody',
    channel: wikiSearch.results
  })
  const table = html`
    <table>
      <thead> <th> Results </th> </thead>
      ${rows}
    </table>
  `
  wikiSearch.state.listen(state => {
    loadingMsg.hidden = !state.loading
    noResults.hidden = !state.noResults
    table.hidden = !state.hasResults
  })

  return html`
    <div>
      <h1> Wikipedia searcher </h1>
      ${searchInput}
      ${loadingMsg}
      ${noResults}
      ${table}
    </div>
  `
}

const rowView = (row, idx) => {
  return (html`
    <tr>
      <td> ${idx.value + 1}. </td>
      <td> 
        <a href='https://en.wikipedia.org/wiki/${row.title.replace(' ', '_')}' target='_blank'>
          ${row.title} 
        </a>
      </td>
    </tr>
  `)
}

document.body.appendChild(view())
