const Master = require('../lib/master')
const assert = require('assert')
const net = require('net')
const {
  CONNECTION_EVENT,
} = require('../lib/constants/event')

const {
  MAPPER_WORKER,
} = require('../lib/constants/worker')

describe('Master constructor', () => {
  describe('constructor', () => {
    it('should start the server', () => {
      const master = new Master({
        port: 8080,
      })
    })
  })
})

describe('processData', () => {
  it('should set the type of a worker when one connects', () => {
    const master = new Master({
      port: 8080,
    })
    const client = net.connect({ port: 8080 }, () => {
      client.write(JSON.stringify({
        type: CONNECTION_EVENT,
        value: MAPPER_WORKER,
      }))
    })
  })
})
