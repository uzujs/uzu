var channel = require('../channel')

function History () {
  return {redoStack: channel([]), undoStack: channel([])}
}

// A new user action is performed; user can no longer redo
// push the action, plus its revert action, into the history's backward stack
// clear out the redo stack
function applyAction ([forward, backward], history) {
  history.undoStack.value.push({forward: forward, backward: backward})
  history.undoStack.send(history.undoStack.value)
  history.redoStack.send([])
  forward()
}

function undo (history) {
  if (!history.undoStack.value.length) {
    throw new Error('Cannot undo: backward history is empty')
  }
  var actions = history.undoStack.value.pop()
  actions.backward()
  history.redoStack.value.push(actions)
  history.undoStack.send(history.undoStack.value)
  history.redoStack.send(history.redoStack.value)
}

function redo (history) {
  if (!history.redoStack.value.length) {
    throw new Error('Cannot redo: forward history is empty')
  }
  var actions = history.redoStack.value.pop()
  actions.forward()
  history.undoStack.value.push(actions)
  history.undoStack.send(history.undoStack.value)
  history.redoStack.send(history.redoStack.value)
}

module.exports = {create: History, applyAction, undo, redo}
