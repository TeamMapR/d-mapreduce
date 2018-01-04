const net = require('net')
const JsonSocket = require('json-socket')

const {
  MAPPER_WORKER,
  REDUCER_WORKER,
} = require('./constants/worker')

const log = require('./logger')

const {
  CONNECTION_EVENT,

  MAPPER_SEND_DATA_EVENT,
  MAPPER_RECEIVE_DATA_EVENT,

  REDUCER_SEND_DATA_EVENT,
  REDUCER_RECEIVE_DATA_EVENT,

} = require('./constants/event')

const {
  sendData,
} = require('./sender')

/**
 * Executes a worker function
 * @param {*} ctx context
 * @param {*} parsed param data
 */
const triggerFunc = (ctx, parsed) => {
  const func = ctx.funcs[parsed.func]
  if (func) {
    ctx.currentJob = parsed.jobId
    return func(parsed.data)
  }
  throw new Error(`Could not find this function: '${parsed.func}'`)
}

/**
 * Sends data to the master node
 * @param {*} ctx context
 * @param {*} parsed data
 * @param {*} type event type
 */
const sendHandler = (ctx, parsed, type) => {
  const res = triggerFunc(ctx, parsed)
  if (res) {
    sendData(ctx.master, {
      type,
      jobId: ctx.currentJob,
      data: res,
    })
    ctx.currentJob = null
  }
}

/**
 * Handles data sent by the master
 * @param {*} ctx context
 * @param {*} parsed data
 */
const handleData = (ctx, parsed) => {
  switch (parsed.type) {
    case MAPPER_SEND_DATA_EVENT:
      sendHandler(ctx, parsed, MAPPER_RECEIVE_DATA_EVENT)
      break

    case REDUCER_SEND_DATA_EVENT:
      sendHandler(ctx, parsed, REDUCER_RECEIVE_DATA_EVENT)
      break

    default:
      break
  }
}

/**
 * Worker constructor
 * @param {*} config worker config
 */
function Worker(config) {
  this.config = config
  this.type = config.type

  try {
    this.host = config.master.split(':')[0] || 'localhost'
    this.port = config.master.split(':')[1] || 80
  } catch (err) {
    throw new Error('Wrong configuration for hostname and port')
  }

  this.funcs = {}
  this.currentJob = null

  return this
}

/**
 * Initialize the worker by creating a
 * TCP connection to the master node
 * @param {*} callback run callback
 */
Worker.prototype.run = function run(callback) {
  this.master = new JsonSocket(new net.Socket())
  this.master.connect(this.port, this.host)

  // Don't send until we're connected
  this.master.on('connect', () => {
    log.worker(`Connected to master node ${this.config.master}`)
    callback()

    sendData(this.master, {
      type: CONNECTION_EVENT,
      value: this.type,
    })
  })

  this.master.on('message', data => handleData(this, data))

  this.master.on('close', () => {
    log.worker(`Connection closed with master node ${this.config.master}`)
    setTimeout(() => {
      this.run(callback);
    }, 1000);
  })

  this.master.on('error', (err) => {
    log.worker(`Could not connect to master node ${this.config.master}: ${err.message}`)
  })
}

/**
 * Registers a function on the worker
 * @param {*} name function name
 * @param {*} func function reference
 */
Worker.prototype.register = function register(name, func) {
  this.funcs[name] = func
  log.worker(`Registered method ${name}`)
}

function Mapper({ master }) {
  return new Worker({
    type: MAPPER_WORKER,
    master,
  })
}

function Reducer({ master }) {
  return new Worker({
    type: REDUCER_WORKER,
    master,
  })
}

module.exports = {
  Mapper,
  Reducer,
}
