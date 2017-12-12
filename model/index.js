module.exports = Model

function Model (initialData) {
  var model = initialData || {}
  model._handlers = {}

  model.onUpdate = function onUpdate (keys, fn) {
    if (typeof keys === 'string') keys = [keys]
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
      if (!model.hasOwnProperty(key)) {
        throw new TypeError(`Undefined key '${key}' for model`)
      }
      fn(model[key])
      if (!model._handlers[key]) model._handlers[key] = []
      model._handlers[key].push(fn)
      if (Model.handlerCache) {
        // Push an unlistener function to the handlerCache
        Model.handlerCache.push(function () {
          model._handlers[key] = model._handlers[key].filter(function (otherFn) {
            return otherFn !== fn
          })
        })
      }
      return model
    }
  }

  model.update = function update (data) {
    for (var key in data) {
      if (!model.hasOwnProperty(key)) {
        throw new TypeError('Invalid key for model: ' + key)
      }
      model[key] = data[key]
      if (model._handlers[key]) {
        model._handlers[key].forEach(function (callback) {
          callback(model[key])
        })
      }
    }
    return model
  }

  return model
}

Model.handlerCache = null

// Catch all event listeners/handlers created during the length of a function
Model.cacheHandlers = function (fn) {
  Model.handlerCache = []
  fn()
  var localCache = Model.handlerCache.slice(0)
  Model.handlerCache = null
  // Return an unlistener function
  return function () {
    for (var i = 0; i < localCache.length; ++i) {
      // Each element in the cache is an unlistener function
      localCache[i]()
    }
  }
}
