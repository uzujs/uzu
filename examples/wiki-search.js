const html = require('bel')
const model = require('../model')
const dom = require('../dom')
const statechart = require('../statechart')

const SearchChart = function () {
  return statechart({
    initial: {noResults: true, notLoading: true},
    states: ['noResults', 'hasResults', 'notLoading', 'loading'],
    events: {
      EMPTY_RESULTS: [ 
        ['noResults', 'noResults'],
        ['hasResults', 'noResults'],
        ['loading', 'notLoading']
      ],
      GOT_RESULTS: [
        ['noResults', 'hasResults'],
        ['hasResults', 'hasResults'],
        ['loading', 'notLoading']
      ],
      SEARCH: ['notLoading', 'loading'],
    }
  })
}

const urlStr = 'https://en.wikipedia.org/w/api.php?action=query&format=json&gsrlimit=20&generator=search&origin=*&gsrsearch='

const apiCall = (search) => window.fetch(urlStr + search, {mode: 'cors'}).then(res => res.json())

const performSearch = (searchModel, searchChart) => ev => {
  searchChart.event('SEARCH')
  const search = ev.currentTarget.value // get input value
  console.log('hi!')
  apiCall(search).then(data => {
    console.log('data', data)
    if (!data.query) {
      searchChart.event('EMPTY_RESULTS')
      searchModel.update({results: []})
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
      searchChart.event('GOT_RESULTS')
      searchModel.update({results: arr})
    }
  })
}

const view = () => {
  const searchChart = SearchChart()
  const searchModel = model({results: []})

  const rows = dom.childSync({
    view: rowView,
    container: 'tbody',
    model: searchModel,
    prop: 'results'
  })

  const searchInput = html`<input type='text' onchange=${performSearch(searchModel, searchChart)} placeholder='Search Wikipedia'>`
  const loadingSpan = html`<span> Loading... </span>`
  const noResults = html`<p> No results yet.. </p>`

  const table = html`
    <table>
      <thead> <th> Results </th> </thead>
      ${rows}
    </table>
  `
  table.hidden = true

  searchChart.when('loading', () => {
    loadingSpan.hidden = false
  }).when('notLoading', () => {
    loadingSpan.hidden = true
  }).when('hasResults', () => {
    noResults.hidden = true
    table.hidden = false
  }).when('noResults', () => {
    noResults.hidden = false
    table.hidden = true
  })

  return html`
    <div>
      <h1> Wikipedia searcher </h1>
      ${searchInput}
      ${loadingSpan}
      ${noResults}
      ${table}
    </div>
  `
}

const rowView = row =>
  html`<tr>
    <td> 
      <a href='https://en.wikipedia.org/wiki/${row.title.replace(' ', '_')}' target='_blank'>
        ${row.title} 
      </a>
    </td>
  </tr>`

document.body.appendChild(view())
