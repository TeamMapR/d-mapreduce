const net = require('net')
const uuid = require('uuid/v4')
const JsonSocket = require('json-socket')

const log = require('./logger')

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

/**
 * Received mapper data handler
 * @param {*} ctx context
 * @param {*} parsed data
 */
const onMapperReceiveData = (ctx, parsed) => {
  const job = ctx.jobs.get(parsed.jobId)
  job.onReceiveData(MAPPER_WORKER, parsed.data)
}

/**
 * Received reducer data handler
 * @param {*} ctx context
 * @param {*} parsed data
 */
const onReducerReceiveData = (ctx, parsed) => {
  const job = ctx.jobs.get(parsed.jobId)
  job.onReceiveData(REDUCER_WORKER, parsed.data)
}

/**
 * Process data sent by nodes
 * @param {*} ctx context
 * @param {String} id node id
 * @param {*} parsed parsed data
 */
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

/**
 * Handles the data received from the nodes
 * @param {*} ctx context
 * @param {String} id node id
 */
const handleReceivedData = (ctx, id) => data => {
  processData(ctx, id, data)
}

/**
 * Handles the disconnection of one node
 * @param {*} ctx context
 * @param {String} id node id
 */
const handleDisconnection = (ctx, id) => () => {
  log.master(`Node ${id} disconnected`)
  ctx.nodes.delete(id)
}

/**
 * Master constructor, creates the TCP server
 * @param {*} config master config
 */
function Master(config) {
  this.nodes = new Map()
  this.jobs = new Map()

  this.processFile = processFile(this)

  const server = net.createServer()
  server.listen(config.port, () => {
    log.master(`Master server listening on 127.0.0.1:${config.port}`)
  })

  server.on('connection', (socket) => {
    const jsonSocket = new JsonSocket(socket)

    const id = uuid()
    this.nodes.set(id, { socket: jsonSocket })

    jsonSocket.on('message', handleReceivedData(this, id))
    jsonSocket.on('end', handleDisconnection(this, id))
  })


  return this
}

module.exports = Master
