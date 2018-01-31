# uzu/statechart

Statecharts are useful for managing complicated asynchronous UI in a declarative way.

Statecharts use the **[harel](https://github.com/jayrbolton/harel) module** and have the same API that can be found there. The main exception is that we wrap the chart in a [channel](../channel) for convenience.

The value returned by `statechart` is a channel with one extra method: `event(eventName)`. Calling this triggers the channel to update with a new set of states based on the given event.

```js
const statechart = require('uzu/statechart')

const chart = statechart({
  states: ['loading', 'hasResults', 'noResults'],
  events: {
    SEARCH: [['hasResults', 'loading'], ['noResults', 'loading']],
    GOT_RESULTS: ['loading', 'hasResults'],
    NO_RESULTS: ['loading', 'noResults']
  },
  initial: {noResults: true}
})

chart.value.noResults // -> true
chart.value.loading // -> undefined
chart.value.hasResults // -> undefined

chart.event('SEARCH')
chart.value.noResults // -> undefined
chart.value.loading // -> true
chart.value.hasResults // -> undefined

chart.event('GOT_RESULTS')
chart.value.noResults // -> undefined
chart.value.loading // -> undefined
chart.value.hasResults // -> true

chart.event('SEARCH')
chart.value.noResults // -> undefined
chart.value.loading // -> true
chart.value.hasResults // -> undefined

chart.event('NO_RESULTS')
chart.value.noResults // -> true
chart.value.loading // -> undefined
chart.value.hasResults // -> undefined
```
