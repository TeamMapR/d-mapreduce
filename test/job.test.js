const { Job } = require('../lib/job')
const assert = require('assert')

describe('Job creator', () => {
  it('should create a job', () => {
    const job = new Job({})
    job
      .map('countWord', 3)
      .reduce('countWord', 4)
      .result(data => {

      })
  })
})
