const uuid = require('uuid/v4')
const Job = require('./job')

const {
  FILE_TYPE,
} = require('./constants/processor')

/**
 * Creates a job for a file
 * @param {*} ctx context
 */
const processFile = ctx => ({ url, separator }) => {
  const id = uuid()
  const job = new Job({
    id,
    nodes: ctx.nodes,
    config: {
      type: FILE_TYPE,
      url,
      separator,
    },
  })
  ctx.jobs.set(id, job)
  return job
}


module.exports = {
  processFile,
}
