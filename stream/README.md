# ev-stream

A tiny implementation of FRP **event streams** in JS, inspired by [flyd](https://github.com/paldepind/flyd).

* very simple and minimal implementation (around 200 SLOC)
* eager, non-lazy evaluation
* catered towards web development
* all functions are curried
* no atomic updates

# API

## create(val)

Create a new event stream with an optional initial value. Push to the stream by **calling it as a function with a value**. Read from the stream by **calling it with no arguments**.

```
a -> Stream(a)
```

```js
const s = stream.create()
s() // -> undefined, no value in the stream yet
s(1) // push a value to the stream
s() // -> 1
s(2) // push another value
s() // -> 2
```

### A note about pushing values

**In practical use, you will not need to manually push values into streams, as shown above**. Manual pushing is provided mostly for convenience, and for illustrative purposes. In your applications, you will want to generally avoid pushing values to streams, except when binding events or wrapping callback functions. **Instead, focus on using the following set of higher-order functions to create new streams from existing ones:**

## map(fn, stream)

Create a stream where each value is `fn` applied to each value from a source stream.

```
(a -> b) -> Stream(a) -> Stream(b)
```

```
s:                {--1--2--3--}
map(n => n*2, s): {--2--4--6--}
```

```js
const s = stream.create()
const mapped = stream.map(n => n + 1, s)
s(1)
mapped() // -> 2
s(2)
mapped() // -> 3
```

## merge([stream1, stream2, ...])

Create a stream that emits values from any of the source streams.

```
[Stream(a)] -> Stream(a)
```

```
s1:              {--a--b--c--}
s2:              {-d--e-----f}
merge([s1, s2]): {-da-eb--c-f}
```

```js
const s1 = stream.create()
const s2 = stream.create()
const merged = stream.merge([s1, s2])
s1(1)
merged() // -> 1
s2(2)
merged() // -> 2
s1(3)
merged() // -> 3
```

## scan(fn, accum, stream)

Create a stream whose values are the result of applying `fn` to a starting value and every value from a source stream. Similar to `reduce` for arrays.

```
((a, b) -> a) -> a -> Stream(b) -> Stream(a)
```

```
s:                             {--1--2--3--}
scan((sum, n) => sum+n, 0, s): {--1--3--6--}
```

```js
const s = stream.create()
const scanned = stream.scan((sum, n) => sum + n, 0, s)
s(1)
scanned() // -> 1
s(2)
scanned() // -> 3
s(3)
scanned() // -> 6
```


## filter(fn, stream)

Create a stream that only emits values from a source stream when `fn` is true when applied to the value from the source stream.

```
(a -> Boolean) -> Stream(a) -> Stream(a)
```

```
s:                 {---1---2---3---4---}
filter(isEven, s): {-------2-------4---}
```

```js
const s = stream.create()
const f = filter(n => n % 2 === 0, s)
s(1)
f() // -> undefined (f does not emit)
s(2)
f() // -> 2 (f emits 2)
s(3)
f() // -> 2 (f remains unchanged, does not emit)
s(4)
f() // -> 4 (f emits 4)
```

## always(val, stream)

Create a stream that always emits `val` whenever anything is emitted from the source stream. This is equivalent to: `map(x => val, stream)`

```
a -> Stream(b) -> Stream(a)
```

```
s:                {--a--b--c--}
always(z, s):  {--z--z--z--}
```

```js
const s = stream.create()
const a = stream.always(1, s)
s(99)
a() // -> 1
s(100)
a() // -> 1
s(101)
a() // -> 1
// Every time s emits anything, a will emit 1
```

## defaultTo(val, stream)

Create a stream with all the same values from the source stream, but whose immediate, default value is `val`. 

```
a -> Stream(a) -> Stream(a)
```

```
s:                {--a--b--c--}
defaultTo(z, s):  {z-a--b--c--}
```

```js
const s = stream.create()
const d = stream.defaultTo('hi!', s)
s() // -> undefined
d() // -> 'hi!'
s(1)
s() // -> 1
d() // -> 1
```

## log(stream, [annotation])

Log values from a stream for quick debugging (optionally pass in an annotation String so you know which stream you are logging). This function is not curried.

```js
const s = stream.create()
log(s, 's')
s(1)
// console prints: "s 1"
```

## flatMap(fn, stream)

Map over a stream, producing a new stream for every value. An example use is to map over clicks, creating ajax requests for each click, and produce a stream of ajax responses.

```
(a -> Stream(b)) -> Stream(a) -> Stream(b)
```

```
s:              {--x------x--}
map(fn, s):     {--▼------▼--} // stream of streams
                  {--y}  {--y}
flatMap(fn, s): {----y------y} // flattened
```

```js
const s = stream.create()
const sNested = stream.create()
const s1 = stream.flatMap(v => sNested, s)
s(1)
s1() // -> undefined
sNested(1)
s1() // -> 1

// flatMap is useful for getting a stream of ajax responses
const click$ = stream.create()
const ajaxResponse$ = stream.flatMap(ev => makeAjaxRequest(xyz), click$)
```

## scanMerge(streams, initialVal)

Scan and merge multiple streams into a single, aggregate stream using an initial value. This one is very handy for combining multiple event streams into a single UI state.

```
[[Stream(a), ((b, a) -> b]] -> b -> Stream(b)
```

```
s1:                                   {---1---3----}
s2:                                   {----2----4--}
scanMerge([[s1, add], [s2, mul]], 0): {---12--5-▼--}
                                                20
```

```js
const add = stream.create()
const mul = stream.create()
const result = stream.scanMerge([
  [add, (sum, n) => sum + n]
, [mul, (sum, n) => sum * n]
], 0)

add(1)
result() // -> 1
mul(2)
result() // -> 2
add(3)
result() // -> 5
mul(4)
result() // -> 20
```

## buffer(n, stream)

Collect values from stream into a buffer array until the array reaches length `n`. Once it reaches length `n`, then emit that array into a stream.

```
Number -> Stream(a) -> Stream([a])
```

```
s:            {---1-2--3--4---}
buffer(2, s): {-----▼-----▼---}
                    [1,2] [3,4]
```

```js
const s = stream.create()
const b = buffer(2, s)
s(1)
b() // -> undefined
s(2)
b() // -> [1,2]
s(3)
b() // -> [1,2]
s(4)
b() // -> [3,4]
```

## object(obj)

Convert an object containing many streams into a single stream of plain, static objects.

```js

const s1 = stream.create()
const s2 = stream.create()
const objOfStreams = {
  s1: s1
, nested: { s2: s2 }
}

const streamOfObjs = stream.object(objOfStreams)
streamOfObjs() // -> {s1: undefined, {s2: undefined}}
s1(1)
streamOfObjs() // -> {s1: 1, {s2: undefined}}
s2(1)
streamOfObjs() // -> {s1: 1, {s2: 1}}
s1(2) 
streamOfObjs() // -> {s1: 2, {s2: 1}}
```

## isStream(value)

Test whether a given value is a stream

```js
stream.isStream(stream.create()) // -> true
stream.isStream({x: 'x'}) // -> false
```

# Time-related

## every(ms, endStream)

Create a new stream that emits a timestamp every `ms`. The stream will end when `endStream` emits any value.

```
Number -> Stream(a) -> Stream(Number)
```

```
(each hyphen represents 10ms)

every(20, e):    {-t-t-t-t----}
```

```js
const end = stream.create()
const e = stream.every(10, end)
const count = stream.scan(c => c + 1, 0, e)

setTimeout(() => {
  count() // -> 1
}, 10)

setTimeout(() => {
  count() // -> 2
  end(true)
}, 20)

setTimeout(() => {
  count() // -> 2 (stream has been ended, so will not get incremented)
}, 30)
```

## throttle(ms, stream)

Create a stream that only emits values from a source stream at most every `ms`

```
Number -> Stream(a) -> Stream(a)
```

```
(each hyphen represents 10ms)

s:               {-abc--defg--h--ij--}
throttle(20, s): {---c----f--g--h--j-}
```

```js
const s = stream.create()
const d = throttle(10, s)
s(1)
s(2)
s(3)
s(4)
s(5)
d() // -> undefined
setTimeout(()=> {
  d() // -> 5
}, 10)
```

In the above example, a 10ms timer is started at `s(1)`, and the value 5 is emitted from `d` when the timer is finished.

## afterSilence(ms, stream)

Create a stream that emits values after `ms` of silence from the source stream.

```
Number -> Stream(a) -> Stream(a)
```

```
(each hyphen represents 10ms)

s:                    {---ab---c----cdef-}
afterSilence(30, s):  {-------b---c------}
```

```
(each hyphen represents 10ms)

s:                    {--abc--d---ef---}
afterSilence(10,s):   {------c--d----f-}
```

```js
const s = stream.create()
const d = stream.afterSilence(10, s)
s(1); s(2)
d() // -> undefined

// 5ms later..
setTimeout(() => {
  s(3)
}, 5)

// 10ms later..
setTimeout(() => {
  d() // -> undefined
}, 10)

// 20ms later..
setTimeout(() => {
  d() // -> 3
  s(4)
  d() // -> 3 (remains unchanged)
}, 20)
```

## delay(ms, stream)

Create a stream that emits every value from a source stream after an `ms` delay

```
Number -> Stream(a) -> Stream(a)
```

```
(each hyphen represents 10ms)

s:            {---a---b---c----}
delay(20, s): {-----a---b---c--}
```

```js
const s = create()
const d = delay(10, s)
s(1)
d() // -> undefined

// Wait 10ms
setTimeout(()=> {
  d() // -> 1
  s(2)
  d() // -> 1
}, 10)

// Wait 20ms
setTimeout(()=> {
  d() // -> 2
}, 20)
```

### "afterSilence" versus "throttle" versus "delay"

The difference between these functions can be confusing, but they each serve their own purpose.

```
(each hyphen represents 10ms)

s:                     {--abc-de---}
throttle(20, s):       {----c---e--}
afterSilence(20, s):   {---------e-}
delay(20, s):          {----abc-de-}
```

In `throttle`, a timer of 20ms starts when `a` first emits. 20ms later, the most recent value gets emitted, which is `c`. Another timer starts at `d`, which causes `e` to get emitted another 20ms later.

In `afterSilence`, a timer of 20ms starts after each emitted value, but then is reset if another value is emitted. The 20ms timers that start after `a`, `b`, `c`, and `d` all get cancelled out by values that get emitted less than 20ms after. Finally, the 20ms timer that starts when `e` is emitted never gets cancelled out, so `e` is emitted after 20ms of silence.

In `delay`, every value from the source stream is always emitted, but after a delay for each value. A timer is started for every value on the source stream, and the value is emitted 20ms later in the new stream.
