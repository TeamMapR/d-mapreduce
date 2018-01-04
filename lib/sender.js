const {
  MAPPER_SEND_DATA_EVENT,
  REDUCER_SEND_DATA_EVENT,
} = require('./constants/event')

/**
 * Send data through the tcp socket
 * @param {*} socket node socket
 * @param {*} payload json data
 */
const sendData = (socket, payload) => {
  socket.sendMessage(payload)
}

/**
 * Send data to the targeted mapper nodes
 * @param {String} jobId job id
 * @param {String} func mapper function name
 * @param {String} fileData text
 * @param {Array} nodes list of mapper nodes
 */
const sendMapperData = (jobId, func, fileData, nodes) => {
  nodes.forEach((node, i) => {
    const data = fileData[i]
    sendData(node.socket, {
      type: MAPPER_SEND_DATA_EVENT,
      jobId,
      func,
      data,
    })
  })
}

/**
 * Send data to the targeted reducer nodes
 * @param {String} jobId job id
 * @param {String} func reducer function name
 * @param {String} fileData text
 * @param {Array} nodes list of reducer nodes
 */
const sendReducerData = (jobId, func, mapperData, nodes) => {
  nodes.forEach((node, i) => {
    const data = mapperData[i]
    sendData(node.socket, {
      type: REDUCER_SEND_DATA_EVENT,
      jobId,
      func,
      data,
    })
  })
}

module.exports = {
  sendMapperData,
  sendReducerData,
  sendData,
}
