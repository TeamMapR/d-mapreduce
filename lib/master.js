const net = require('net')

const handleReceivedData = socket => data => {

}

const handleDisconnection = socket => () => {

}

function Master(config) {
  this.port = config.port
  this.nodes = new Map()

  net.createServer((socket) => {
    socket.on('data', handleReceivedData(socket))
    socket.on('end', handleDisconnection(socket))
  }).listen(this.port)

  return this
}

module.exports = Master
