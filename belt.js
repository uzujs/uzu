
function belt (config) {
  function send (idx) {
    return function (boxes) {
      let anyFound = false
      for (let label in boxes) {
        const contents = boxes[label]
        let found = false
        for (let i = 0; !found && i < workers.length; ++i) {
          const offset = (i + idx) % workers.length
          const w = workers[offset]
          if (w.offer(label, contents)) {
            found = true
          }
        }
        anyFound = anyFound || found
      }
      return anyFound
    }
  }
  const workers = config.map((worker, idx) => {
    if (worker.splice) {
      const spliceBelt = worker.splice
      const receiveLabels = Object.keys(worker.receive || {})
      const sendLabels = Object.keys(worker.send || {})
      // Add an output worker that takes boxes labels with any keys in worker.send, and sends out
      // those boxes to the parent belt labeled worker.send[label]
      spliceBelt.workers.push(
        initWorker({
          receiveAny: sendLabels,
          process: (contents) => {
            for (let label in contents) {
              const aliased = worker.send[label]
              send(idx + 1)({[aliased]: contents[label]})
            }
          }
        }, send, spliceBelt.workers.length)
      )
      // Add an input worker that takes box laels with any keys in worker.receive, and sends in
      // those boxes to the child belt labeled worker.receive[label]
      return initWorker({
        receiveAny: receiveLabels,
        process: (contents) => {
          for (let label in contents) {
            const aliased = worker.receive[label]
            const sent = spliceBelt.send({[aliased]: contents[label]})
            if (!sent) {
              send(idx + 1)({[label]: contents[label]})
            }
          }
        }
      }, send, idx)
    } else {
      // Regular worker; not a belt splice
      return initWorker(worker, send, idx)
    }
  })
  return {
    send: send(0),
    workers,
    then: function (callback) {
      listeners.push(callback)
    }
  }
}

function initWorker (config, send, idx) {
  const worker = {}
  worker.received = {}
  worker.receivedCount = 0
  worker.offer = function (label, contents) {
    if (config.receiveAny) {
      if (config.receiveAny.indexOf(label) !== -1) {
        config.process({[label]: contents}, send(idx + 1))
        return true
      }
    }
    if (config.receiveAll) {
      if (config.receiveAll.indexOf(label) !== -1 && !(label in worker.received)) {
        worker.received[label] = contents
        worker.receivedCount += 1
        if (worker.receivedCount === config.receiveAll.length) {
          const received = worker.received
          worker.receivedCount = 0
          worker.received = {}
          config.process(received, send(idx + 1))
        }
        return true
      }
    }
    // Not receivable
    return false
  }
  return worker
}

const adder = belt([
  {
    receiveAll: ['sum', 'add'],
    process: ({sum, add}, send) => {
      console.log('adding', sum, add)
      send({sum: sum + add})
    }
  }
])

const multiplier = belt([
  {
    receiveAll: ['total', 'mul'],
    process: ({total, mul}, send) => {
      console.log('multiplying', total, mul)
      send({total: total * mul})
    }
  }
])

const combo = belt([
  {
    splice: multiplier,
    receive: {
      total: 'total',
      mul: 'mul'
    },
    send: {
      total: 'total'
    }
  },
  {
    splice: adder,
    receive: {
      total: 'sum',
      add: 'add'
    },
    send: {
      sum: 'total'
    }
  },
  {
    receiveAll: ['total'],
    process: ({total}, send) => {
      console.log('total:', total)
      send({total})
    }
  }
])

const multiCount = belt([
  {
    receiveAll: ['id', 'incr', 'allCounters'],
    process: ({id, sum, allCounters}, send) => {
      allCounters[id] += 1
      send({ allCounters })
    }
  },
  {
    receiveAll: ['allCounters'],
    process: ({allCounters}, send) => {
      console.log(allCounters)
      send({allCounters})
    }
  }
])

// the belt should be stateless; it is a workflow
// the state travels along it
// you can accumulate by resending values that you have received

const counter = belt([
  {
    receiveAll: ['count'],
    process: ({count}, send) => send({count: count + 1})
  }
])

multiCount.send({allCounters: {0: 0, 1: 10}})
multiCount.send({id: 0, incr: true})
multiCount.send({id: 0, incr: true})
multiCount.send({id: 0, incr: true})
multiCount.send({id: 1, incr: true})
multiCount.send({id: 0, incr: true})
multiCount.send({id: 1, incr: true})

// TODO how to get out a final result from one .send?
