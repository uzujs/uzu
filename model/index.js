module.exports = Model

function Model (initialData) {
  var model = initialData || {}
  model._listeners = {}

  model.onUpdate = function onUpdate (key, callback) {
    if (!model.hasOwnProperty(key)) {
      throw new TypeError(`Undefined key '${key}' for model`)
    }

    callback(model[key])
    if (!model._listeners[key]) model._listeners[key] = []
    model._listeners[key].push(callback)

    if (Model.listening) {
      var prev = Model.unlisten
      Model.unlisten = function () {
        prev()
        model._listeners[key] = model._listeners[key].filter(function (fn) {
          return fn !== callback
        })
      }
    }
  }

  model.update = function update (data) {
    for (var key in data) {
      if (!model.hasOwnProperty(key)) {
        throw new TypeError('Invalid key for model: ' + key)
      }
      model[key] = data[key]
      if (model._listeners[key]) {
        model._listeners[key].forEach(function (callback) {
          callback(model[key])
        })
      }
    }
    return model
  }

  return model
}

Model.listening = false
Model.unlisten = function () {}

// Catch all event listeners/handlers created during the length of a function
// Return a function that removes all created handlers
Model.listen = function (fn) {
  Model.listening = true
  Model.unlisten = function () {}
  fn()
  var unlisten = Model.unlisten
  Model.listening = false
  Model.unlisten = function () {}
  // Return a single unlistener function
  return unlisten
}
