const curryN = require('ramda/src/curryN')

module.exports = curryN(2, function modelView (model, view) {
  document._hCacheStreams = true
  const {streams} = view({})
  delete document._hCacheStreams
  const result = model(streams)
  document._hReadCache = true
  const {elm} = view(result)
  delete document._hCachedStreams
  delete document._hReadCache
  return {elm, streams}
})

