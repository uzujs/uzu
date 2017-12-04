var model = require('../model')

function History () {
  return model({redoStack: [], undoStack: []}, {
    // A new user action is performed; user can no longer redo
    // push the action, plus its revert action, into the history's backward stack
    // clear out the redo stack
    applyAction: ([forward, backward], history, update) => {
      history.undoStack.push({forward: forward, backward: backward})
      update({undoStack: history.undoStack, redoStack: []})
      forward()
    },
    undo: (_, history, update) => {
      if (!history.undoStack.length) {
        throw new Error('Cannot undo: backward history is empty')
      }
      var actions = history.undoStack.pop()
      actions.backward()
      history.redoStack.push(actions)
      update({
        undoStack: history.undoStack,
        redoStack: history.redoStack
      })
    },
    redo: (_, history, update) => {
      if (!history.redoStack.length) {
        throw new Error('Cannot redo: forward history is empty')
      }
      var actions = history.redoStack.pop()
      actions.forward()
      history.undoStack.push(actions)
      update({
        undoStack: history.undoStack,
        redoStack: history.redoStack
      })
    }
  })
}

module.exports = History
