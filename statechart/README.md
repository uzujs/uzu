# uzu/statechart

Statecharts are useful for managing complicated asynchronous UI. This is a small implementation of these statecharts. 

The `statechart` function returns a state, which uses [channels](/channel). The API is the same, with the added method `state.event(eventName)`

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

state.value.noResults // -> true
state.value.loading // -> undefined
state.value.hasResults // -> undefined

state.event('SEARCH')
state.value.enoResults // -> undefined
state.value.eloading // -> true
state.value.ehasResults // -> undefined

state.event('GOT_RESULTS')
state.value.noResults // -> undefined
state.value.loading // -> undefined
state.value.hasResults // -> true

state.event('SEARCH')
state.value.noResults // -> undefined
state.value.loading // -> true
state.value.hasResults // -> undefined

state.event('NO_RESULTS')
state.value.noResults // -> true
state.value.loading // -> undefined
state.value.hasResults // -> undefined
```

You can run multiple, parallel states simply by setting multiple keys to true in the `initial` object.

## Nested states

Coming soon.

## Transition guards

Coming soon.

