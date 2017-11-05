const {
  MAPPER_SEND_DATA_EVENT,
  REDUCER_SEND_DATA_EVENT,
} = require('./constants/event')

const sendData = (node, payload) => {
  const json = JSON.stringify(payload)
  node.socket.write(json)
}

const sendMapperData = (jobId, func, fileData, nodes) => {
  nodes.forEach((node, i) => {
    const data = fileData[i]
    sendData(node, {
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
    sendData(node, {
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
}
