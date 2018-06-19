const {h, component, debug} = require('..')

const urlStr = 'https://en.wikipedia.org/w/api.php?action=query&format=json&gsrlimit=20&generator=search&origin=*&gsrsearch='

function WikiSearch () {
  return component({
    state: {results: [], status: 'noResults', searchTerm: ''},
    on: {
      CLEAR: function (_, state, emit) {
        state.results = []
        state.status = 'noResults'
        state.searchTerm = ''
        emit('UPDATE', state)
      },
      CHANGE_SEARCH: function (event, state, emit) {
        const searchStr = event.currentTarget.value
        state.searchTerm = searchStr
        emit('SEARCH')
      },
      SEARCH: function (_, state, emit) {
        if (!state.searchTerm.length) {
          return emit('CLEAR')
        }
        state.status = 'loading'
        emit('UPDATE', state)
        performSearch(state.searchTerm, (results) => {
          if (results) {
            state.status = 'hasResults'
            state.results = results
          } else {
            state.status = 'noResults'
            state.results = []
          }
          emit('UPDATE', state)
        })
      }
    },
    view: view
  })
}

function performSearch (searchStr, cb) {
  window.fetch(urlStr + searchStr, {mode: 'cors'})
    .then(res => res.json())
    .then(data => {
      if (!data.query) {
        cb()
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
        cb(arr)
      }
    })
}

function view (state, emit) {
  return h('div', [
    h('style', {props: {innerHTML: '.hide {display: none;}'}}),
    h('h1', 'Wikipedia searcher'),
    h('input', {
      props: {type: 'text', placeholder: 'Search term', value: state.searchTerm},
      on: {change: ev => emit('CHANGE_SEARCH', ev)}
    }),
    h('button', {on: {click: () => emit('SEARCH')}}, 'Search'),
    h('button', {on: {click: () => emit('CLEAR')}}, 'Clear'),
    h('p', {class: {hide: state.status !== 'loading'}}, 'Loading...'),
    h('p', {class: {hide: state.status !== 'noResults'}}, 'No results yet.'),
    h('table', {
      class: {hide: state.status !== 'hasResults'}
    }, [
      h('thead', [h('th', 'Results')]),
      h('tbody', state.results.map(function (row, idx) {
        return h('tr', [
          h('td', idx + 1),
          h('td', [
            h('a', {
              props: {
                href: `https://en.wikipedia.org/wiki/${row.title.replace(' ', '_')}`,
                target: '_blank'
              }
            }, [ row.title ])
          ])
        ])
      }))
    ])
  ])
}

const wikiSearch = WikiSearch()
debug(wikiSearch, 'wikiSearch')
document.body.appendChild(wikiSearch.node)
