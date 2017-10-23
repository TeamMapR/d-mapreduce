const Job = require('./job')

const processFile = nodes => path =>
  new Job({
    nodes,
    config: {
      type: Job.FILE_TYPE,
      path,
    },
  })

/*
new Promise((resolve, reject) =>
    fs.readFile(path, (err, data) => {
      if (err) reject(new Error(`could not open file to process: ${err.message}`))
      resolve()
    }))
*/

module.exports = {
  processFile,
}
