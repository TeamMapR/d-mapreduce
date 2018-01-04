const debug = require('debug')

module.exports = {
  job: debug('d-mapreduce:job'),
  master: debug('d-mapreduce:master'),
  worker: debug('d-mapreduce:worker'),
}
