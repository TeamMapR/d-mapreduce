const net = require('net')
const uuid = require('uuid/v4')
const { processFile } = require('./processors')

const CONNECTION_EVENT = 'conn'

const processData = (nodes, id, parsed) => {
  switch (parsed.type) {
    case CONNECTION_EVENT:
      if (nodes.get(id)) {
        nodes.set(id, {
          socket: nodes.get(id).socket,
          type: parsed.value,
        })
      }
      return

    default:
      throw new Error('Message cannot be handled')
  }
}

const handleReceivedData = (nodes, id) => data => {
  try {
    const parsed = JSON.parse(data)
    processData(nodes, id, parsed)
  } catch (error) {
    throw new Error(`FATAL ERROR: could not decode data received by worker: ${error.message}`)
  }
}

const handleDisconnection = (nodes, id) => () => {
  nodes.delete(id)
}

function Master(config) {
  this.nodes = new Map()
  this.processFile = processFile(this.nodes)

  net.createServer((socket) => {
    const id = uuid()
    this.nodes.set(id, {
      socket,
    })
    socket.on('data', handleReceivedData(this.nodes, socket, id))
    socket.on('end', handleDisconnection(this.nodes, id))
  }).listen(config.port)

  return this
}

module.exports = Master
