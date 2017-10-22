const mapreduce = require('../index.js')
const assert = require('assert')

describe('Master constructor', () => {
  describe('constructor', () => {
    it('should start the server', () => {
      mapreduce.Master({
        port: 8080,
      })
    })

    it('should set the conf values', () => {
      const master = mapreduce.Master({
        port: 8080,
      })

      assert.equal(master.port, 8080)
    })

  })
})
