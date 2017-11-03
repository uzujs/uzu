const html = require('bel')
const state = require('../index')
const dom = require('../dom')

const apiCall = (search) =>
  fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&gsrlimit=20&generator=search&origin=*&gsrsearch=" + search, {mode: 'cors'})
    .then(res => res.json())

const performSearch = wikiSearch => ev => {
  wikiSearch.update({loading: true})
  const search = ev.currentTarget.value // get input value
  apiCall(search).then(data => {
    if (!data.query) {
      wikiSearch.update({results: [], loading: false})
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
      wikiSearch.update({results: arr, loading: false})
    }
  })
}

const view = () => {
  const wikiSearch = state({results: [], loading: false})

  const rows = dom.childSync({
    view: rowView,
    container: 'tbody',
    state: wikiSearch,
    prop: 'results'
  })

  const searchInput = html`<input type='text' onchange=${performSearch(wikiSearch)} placeholder='Search Wikipedia'>`
  const loadingSpan = html`<span> Loading... </span>`
  wikiSearch.on('loading', l => {
    loadingSpan.style.display = l ? 'inline-block' : 'none'
  })

  const noResults = html`<p> No results yet.. </p>`
  wikiSearch.on('results', r => {
    noResults.style.display = r.length ? 'none' : 'block'
  })

  const table = html`
    <table>
      <thead> <th> Results </th> </thead>
      ${rows}
    </table>
  `
  wikiSearch.on('results', r => {
    table.style.display = r.length ? 'block' : 'none'
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
