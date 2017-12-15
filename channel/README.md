
# uzu/channel

Channels hold dynamic data. They have a very simple API: you can send new data into them, and you can listen for changes on them.

```js
var Channel = require('uzu/channel')
var channel = Channel('hello world')
channel.send('goodbye world')
channel.listen(string => { console.log('new string', string) })
```

## Channel(initialValue)

Create a new channel, passing in its initial value

## channel.send(newValue)

Send a new value to an existing channel. This is a method on a channel instance

## channel.listen(callback)

Call a function every time the channel receives a new value. This is a method on a channel instance

## Channel.createUnlistener(callback)

Run a block of code and capture all listeners that get created. Returns a function that you can call to remove all captured listeners.
