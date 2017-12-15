var channel = require('../channel')
var dom = {}
module.exports = dom

dom.childSync = function childSync (options) {
  // Convert the container to a basic dom if it is a string tagname
  if (!options.container) {
    options.container = document.createElement('span')
  } else if (typeof options.container === 'string') {
    options.container = document.createElement(options.container)
  }
  var container = options.container
  var inserted = {} // track already-inserted dom nodes based on object id
  options.channel.listen(update)

  // Given a new set of data, update the child dom elements
  function update (arr) {
    // Mark each new element in an object
    var obj = {}
    var idx
    var id
    var elem

    for (idx = 0; idx < arr.length; ++idx) {
      elem = arr[idx]
      if (!elem || !elem.hasOwnProperty('id')) throw new Error('Each object in your array should have a .id')
      obj[elem.id] = true
    }

    // Find all removed elements
    for (id in inserted) {
      if (!obj[id]) {
        container.removeChild(inserted[id].node)
        inserted[id].unlisten()
        delete inserted[id]
      }
    }

    // Sync existing and new elements
    for (idx = 0; idx < arr.length; ++idx) {
      id = arr[idx].id
      elem = inserted[id]
      if (!elem) {
        var idxChan = channel(idx)
        var node
        var unlisten = channel.createUnlistener(function () {
          node = options.view(arr[idx], idxChan)
          node.dataset['uzu_id'] = id
        })
        elem = {idxChan: idxChan, node: node, unlisten: unlisten}
        inserted[id] = elem
      } else {
        if (idx !== elem.idxChan.value) {
          elem.idxChan.send(idx)
        }
      }

      var existingNode = container.children[idx]
      if (existingNode) {
        if (String(existingNode.dataset['uzu_id']) !== String(id)) {
          container.insertBefore(elem.node, existingNode)
        }
      } else {
        container.appendChild(elem.node)
      }
    }
  }
  return container
}

dom.route = function route (options) {
  if (!options.container) {
    options.container = document.createElement('span')
  } else if (typeof options.container === 'string') {
    options.container = document.createElement(options.container)
  }
  var prevPage
  var unlisten
  options.channel.listen(function (page) {
    if (page === prevPage) return
    var child
    if (unlisten) unlisten()
    unlisten = channel.createUnlistener(function () {
      child = options.routes[page]()
    })
    while (options.container.firstChild) {
      options.container.removeChild(options.container.firstChild)
    }
    options.container.appendChild(child)
    prevPage = page
  })
  return options.container
}
