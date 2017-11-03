var state = require('../')

function History () {
  return state({redoStack: [], undoStack: []})
}

// A new user action is performed; user can no longer redo
// push the action, plus its revert action, into the history's backward stack
// clear out the redo stack
function applyAction (history, forward, backward) {
  history.undoStack.push({forward: forward, backward: backward})
  history.update({undoStack: history.undoStack, redoStack: []})
  forward()
}

function undo (history) {
  if (!history.undoStack.length) {
    throw new Error('Cannot undo: backward history is empty')
  }
  var actions = history.undoStack.pop()
  actions.backward()
  history.redoStack.push(actions)
  history.update({
    undoStack: history.undoStack,
    redoStack: history.redoStack
  })
}

function redo (history) {
  if (!history.redoStack.length) {
    throw new Error('Cannot redo: forward history is empty')
  }
  var actions = history.redoStack.pop()
  actions.forward()
  history.undoStack.push(actions)
  history.update({
    undoStack: history.undoStack,
    redoStack: history.redoStack
  })
}

module.exports = {
  History: History,
  applyAction: applyAction,
  undo: undo,
  redo: redo
}
