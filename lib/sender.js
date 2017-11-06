const {
  MAPPER_SEND_DATA_EVENT,
  REDUCER_SEND_DATA_EVENT,
} = require('./constants/event')

const sendData = (socket, payload) => {
  const json = JSON.stringify(payload)
  socket.write(json)
}

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
