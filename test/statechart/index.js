const test = require('tape')
const statechart = require('../../statechart')

const editing = {
  initial: {viewing: true, notLoading: true},
  states: ['viewing', 'loading', 'notLoading', 'showingForm', 'confirmingRemove'],
  events: {
    REQUEST: ['notLoading', 'loading'],
    DONE: ['loading', 'notLoading'],
    OPEN_FORM: ['viewing', 'showingForm'],
    REMOVE: ['viewing', 'confirmingRemove'],
    CLOSE: ['showingForm', 'viewing'],
    DENY: ['confirmingRemove', 'viewing'],
    CONFIRM: ['confirmingRemove', 'viewing']
  }
}

const Crud = () => statechart({
  initial: {listing: true},
  states: ['listing', 'importing', 'confirmingRemove', 'editing'],
  events: {
    IMPORT: ['listing', 'importing'],
    CLOSE: [['importing', 'listing'], ['editing', 'listing']],
    EDIT: ['listing', 'editing'],
    REMOVE: ['listing', 'confirmingRemove'],
    DENY: ['confirmingRemove', 'listing'],
    CONFIRM: ['confirmingRemove', 'listing']
  },
  where: {editing: editing}
})

test('crud events', t => {
  const crud = Crud()
  t.throws(() => crud.event('BLAH!'))
  t.throws(() => crud.event('editing.BLAH!'))
  t.deepEqual(crud.state, {listing: true})
  crud.event('IMPORT')
  t.deepEqual(crud.state, {importing: true})
  crud.event('CLOSE')
  t.deepEqual(crud.state, {listing: true})
  crud.event('REMOVE')
  t.deepEqual(crud.state, {confirmingRemove: true})
  crud.event('DENY')
  t.deepEqual(crud.state, {listing: true})
  crud.event('EDIT')
  t.deepEqual(crud.state, {editing: {viewing: true, notLoading: true}})
  crud.event('editing.REQUEST')
  t.deepEqual(crud.state, {editing: {viewing: true, loading: true}})
  crud.event('editing.DONE')
  t.deepEqual(crud.state, {editing: {viewing: true, notLoading: true}})
  crud.event('editing.OPEN_FORM')
  t.deepEqual(crud.state, {editing: {showingForm: true, notLoading: true}})
  crud.event('editing.CLOSE')
  t.deepEqual(crud.state, {editing: {viewing: true, notLoading: true}})
  crud.event('editing.REMOVE')
  t.deepEqual(crud.state, {editing: {confirmingRemove: true, notLoading: true}})
  crud.event('editing.DENY')
  t.deepEqual(crud.state, {editing: {viewing: true, notLoading: true}})
  t.end()
})

test('crud hasState', t => {
  const crud = Crud()
  t.not(crud.hasState('bouncing'))
  t.assert(crud.hasState('listing'))
  t.assert(crud.hasState('importing'))
  t.assert(crud.hasState('confirmingRemove'))
  t.assert(crud.hasState('editing'))
  t.assert(crud.hasState('editing.viewing'))
  t.assert(crud.hasState('editing.loading'))
  t.assert(crud.hasState('editing.notLoading'))
  t.assert(crud.hasState('editing.showingForm'))
  t.assert(crud.hasState('editing.confirmingRemove'))
  t.end()
})

test('crud hasEvent', t => {
  const crud = Crud()
  t.not(crud.hasEvent('FOO'))
  t.assert(crud.hasEvent('IMPORT'))
  t.assert(crud.hasEvent('CLOSE'))
  t.assert(crud.hasEvent('EDIT'))
  t.assert(crud.hasEvent('REMOVE'))
  t.assert(crud.hasEvent('DENY'))
  t.assert(crud.hasEvent('CONFIRM'))
  t.assert(crud.hasEvent('editing.REQUEST'))
  t.assert(crud.hasEvent('editing.DONE'))
  t.assert(crud.hasEvent('editing.OPEN_FORM'))
  t.assert(crud.hasEvent('editing.REMOVE'))
  t.assert(crud.hasEvent('editing.CLOSE'))
  t.assert(crud.hasEvent('editing.DENY'))
  t.assert(crud.hasEvent('editing.CONFIRM'))
  t.not(crud.hasEvent('editing.FOO'))
  t.end()
})

test('when', t => {
  const crud = Crud()
  crud.when({
    importing: {
      CLOSE: () => {
        t.assert(true, 'calls importing/CLOSE handler')
      }
    },
    editing: {
      CLOSE: () => {
        t.assert(true, 'calls editing/CLOSE handler')
        t.end()
      },
      notLoading: {
        REQUEST: () => {
          t.assert(true, 'calls editing.notLoading/REQUEST handler')
        }
      }
    }
  })
  crud.event('IMPORT')
  crud.event('CLOSE')
  crud.event('EDIT')
  crud.event('editing.REQUEST')
  crud.event('CLOSE')
})
