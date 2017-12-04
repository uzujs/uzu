const html = require('bel')
const model = require('../model')
const statechart = require('../statechart')
const dom = require('../dom')

const WikiSearch = () => {
  const state = statechart({
    states: ['loading', 'hasResults', 'noResults'],
    events: {
      SEARCH: [['hasResults', 'loading'], ['noResults', 'loading']],
      GOT_RESULTS: ['loading', 'hasResults'],
      NO_RESULTS: ['loading', 'noResults']
    },
    initial: {noResults: true}
  })
  return model({
    results: [],
    state: state
  }, {
    search: (ev, m, update) => {
      update({state: m.state.event('SEARCH')})
      performSearch(ev.currentTarget.value, (err, results) => {
        if (err) throw err
        update({
          state: m.state.event(results.length ? 'GOT_RESULTS' : 'NO_RESULTS'),
          results: results
        })
      })
    }
  })
}

const urlStr = 'https://en.wikipedia.org/w/api.php?action=query&format=json&gsrlimit=20&generator=search&origin=*&gsrsearch='

const apiCall = (search) =>
  window.fetch(urlStr + search, {mode: 'cors'}).then(res => res.json())

const performSearch = (searchStr, cb) => {
  apiCall(searchStr).then(data => {
    if (!data.query) {
      cb(null, [])
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
      cb(null, arr)
    }
  })
}

const view = () => {
  const wikiSearch = WikiSearch()
  const searchInput = html`<input type='text' onchange=${wikiSearch.events.search} placeholder='Search Wikipedia'>`
  const loadingMsg = html`<p> Loading... </p>`
  const noResults = html`<p> No results yet.. </p>`
  const rows = dom.childSync({
    view: rowView,
    container: 'tbody',
    model: wikiSearch,
    prop: 'results'
  })
  const table = html`
    <table>
      <thead> <th> Results </th> </thead>
      ${rows}
    </table>
  `
  wikiSearch.onUpdate('state', s => {
    loadingMsg.hidden = true
    table.hidden = true
    noResults.hidden = true
    if (s.loading) {
      loadingMsg.hidden = false
    } else if (s.noResults) {
      noResults.hidden = false
    } else {
      table.hidden = false
    }
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

const rowView = row => (html`
  <tr>
    <td> 
      <a href='https://en.wikipedia.org/wiki/${row.title.replace(' ', '_')}' target='_blank'>
        ${row.title} 
      </a>
    </td>
  </tr>
`)

document.body.appendChild(view())
