# uzu/statechart

Statecharts are useful for managing complicated asynchronous UI. This is a small and stateless implementation of these statecharts.

```js
const state = statechart({
  states: ['loading', 'hasResults', 'noResults'],
  events: {
    SEARCH: [['hasResults', 'loading'], ['noResults', 'loading']],
    GOT_RESULTS: ['loading', 'hasResults'],
    NO_RESULTS: ['loading', 'noResults']
  },
  initial: {noResults: true}
})

state.noResults // -> true
state.loading // -> undefined
state.hasResults // -> undefined

state.event('SEARCH')
state.noResults // -> undefined
state.loading // -> true
state.hasResults // -> undefined

state.event('GOT_RESULTS')
state.noResults // -> undefined
state.loading // -> undefined
state.hasResults // -> true

state.event('SEARCH')
state.noResults // -> undefined
state.loading // -> true
state.hasResults // -> undefined

state.event('NO_RESULTS')
state.noResults // -> true
state.loading // -> undefined
state.hasResults // -> undefined
```

You can run multiple, parallel states simply by setting multiple keys to true in the `initial` object.

## Nested states

Coming soon.

## Transition guards

Coming soon.

