const Master = require('../lib/master')
const assert = require('assert')
const net = require('net')

describe('Master constructor', () => {
  describe('constructor', () => {
    it('should start the server', () => {
      Master({
        port: 8080,
      })
    })
  })
})

describe('processData', () => {
  it('should set the type of a worker when one connects', () => {
    Master({
      port: 8080,
    })
    const client = net.connect({ port: 8080 }, () => {
      client.write(JSON.stringify({ type: 'conn', value: 'map' }))
    })
  })
})
