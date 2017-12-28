const net = require('net')
const uuid = require('uuid/v4')

const { processFile } = require('./processors')

const {
  CONNECTION_EVENT,
  MAPPER_RECEIVE_DATA_EVENT,
  REDUCER_RECEIVE_DATA_EVENT,
} = require('./constants/event')

const {
  MAPPER_WORKER,
  REDUCER_WORKER,
} = require('./constants/worker')


const onMapperReceiveData = (ctx, parsed) => {
  const job = ctx.jobs.get(parsed.jobId)
  job.onReceiveData(MAPPER_WORKER, parsed.data)
}

const onReducerReceiveData = (ctx, parsed) => {
  const job = ctx.jobs.get(parsed.jobId)
  job.onReceiveData(REDUCER_WORKER, parsed.data)
}

const processData = (ctx, id, parsed) => {
  switch (parsed.type) {
    case CONNECTION_EVENT:
      if (ctx.nodes.get(id)) {
        ctx.nodes.set(id, {
          socket: ctx.nodes.get(id).socket,
          type: parsed.value,
        })
      }
      return

    case MAPPER_RECEIVE_DATA_EVENT:
      onMapperReceiveData(ctx, parsed)
      return

    case REDUCER_RECEIVE_DATA_EVENT:
      onReducerReceiveData(ctx, parsed)
      return

    default:
      throw new Error(`Message cannot be handled: ${parsed.type}`)
  }
}

const handleReceivedData = (ctx, nodeId) => data => {
  let parsed
  try {
    parsed = JSON.parse(data)
  } catch (error) {
    console.error(`Could not decode data received by worker: ${error.message}`)
    return
  }
  processData(ctx, nodeId, parsed)
}

const handleDisconnection = (ctx, id) => () => {
  console.info(`Node ${id} disconnected`)
  ctx.nodes.delete(id)
}

function Master(config) {
  this.nodes = new Map()
  this.jobs = new Map()

  this.processFile = processFile(this)

  const server = net.createServer((socket) => {
    const id = uuid()
    this.nodes.set(id, { socket })

    socket.on('data', handleReceivedData(this, id))
    socket.on('end', handleDisconnection(this, id))
  })
  server.listen(config.port)
  console.log(`Master server listening on 127.0.0.1:${config.port}`)

  return this
}

module.exports = Master
