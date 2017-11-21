const net = require('net')
const {
  MAPPER_WORKER,
  REDUCER_WORKER,
} = require('./constants/worker')

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


const triggerFunc = (ctx, parsed) => {
  const func = ctx.funcs[parsed.func]
  if (func) {
    ctx.currentJob = parsed.jobId
    return func(parsed.data)
  }
  return null
}


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


function Worker(config) {
  this.config = config
  this.type = config.type
  this.host = config.master.split(':')[0] || 'localhost'
  this.port = config.master.split(':')[1] || 80
  this.funcs = {}
  this.currentJob = null

  return this
}

Worker.prototype.run = function run(callback) {
  this.master = net.connect(this.port, this.host, () => {
    console.log(`Connected to master node ${this.config.master}`)

    sendData(this.master, {
      type: CONNECTION_EVENT,
      value: this.type,
    })
  })

  this.master.on('data', data => {
    try {
      const json = JSON.parse(data)
      handleData(this, json)
    } catch (error) {
      console.error('could not parse received data', error)
    }
  })


  this.master.on('close', () => {
    console.log(`Connection closed with master node ${this.config.master}`)
    if (callback) {
      callback(null)
    }
  })

  this.master.on('error', (err) => {
    console.error(`Could not connect to master node ${this.config.master}:`, err.message)
    if (callback) {
      callback(err)
    }
  })
}

Worker.prototype.register = function register(name, func) {
  this.funcs[name] = func
  console.log(`Registered method ${name}`)
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
