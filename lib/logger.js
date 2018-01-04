const debug = require('debug')

module.exports = {
  job: debug('d-mapreduce:job'),
  jobData: debug('d-mapreduce:job-data'),
  master: debug('d-mapreduce:master'),
  worker: debug('d-mapreduce:worker'),
}
