
const {
  readFile,
  spreadData,
  shuffle,
} = require('./util')

const {
  MAPPER_WORKER,
  REDUCER_WORKER,
} = require('./constants/worker')

const {
  sendMapperData,
  sendReducerData,
} = require('./sender')

const {
  FILE_TYPE,
} = require('./constants/processor')

const log = require('./logger')

const result = ctx => callback => {
  ctx.onResult = callback
}

function ReduceJob(ctx) {
  this.result = result(ctx)
}

const reduce = ctx => (funcName, workersNb) => {
  ctx.reduceConf = {
    funcName,
    workersNb,
  }
  return new ReduceJob(ctx)
}

function MapJob(ctx) {
  this.reduce = reduce(ctx)
}

const map = ctx => (funcName, workersNb) => {
  ctx.mapConf = {
    funcName,
    workersNb,
  }
  return new MapJob(ctx)
}

const getProcessor = conf => {
  switch (conf.type) {
    case FILE_TYPE:
      return readFile(conf.url)

    default:
      break
  }
}

/**
 * Filter the mapper nodes from the list of nodes
 * and selects only the number needed by the job config
 * or the number of nodes available
 * @param {*} ctx context
 */
const getMapNodes = ctx => {
  const nodes = Array.from(ctx.nodes.values())
    .filter(n => n.type === MAPPER_WORKER)
  const nb = Math.min(nodes.length, ctx.mapConf.workersNb)
  return nodes.slice(0, nb)
}

/**
 * Filter the reducer nodes from the list of nodes
 * and selects only the number needed by the job config
 * or the number of nodes available
 * @param {*} ctx context
 */
const getReducerNodes = ctx => {
  const nodes = Array.from(ctx.nodes.values())
    .filter(n => n.type === REDUCER_WORKER)
  const nb = Math.min(nodes.length, ctx.reduceConf.workersNb)
  return nodes.slice(0, nb)
}

/**
 * Try to get the reducer nodes for this job, then shuffle
 * and send shuffled data to the reducer nodes
 * @param {*} ctx context
 */
const handleMapperResults = ctx => {
  const reducerNodes = getReducerNodes(ctx)
  if (reducerNodes.length === 0) {
    log.job('No reducer node available, retrying..')
    setTimeout(() => {
      handleMapperResults(ctx)
    }, 2000)
  }

  ctx.reducerNodes = reducerNodes
  const shuffled = shuffle(ctx.mapperResults, ctx.reducerNodes)
  sendReducerData(
    ctx.jobId,
    ctx.reduceConf.funcName,
    shuffled,
    ctx.reducerNodes,
  )
}

/**
 * Handle the data sent by the mapper
 * or the reducer node
 * @param {*} ctx context
 */
const handleReceiveData = ctx => (type, data) => {
  switch (type) {
    case MAPPER_WORKER:
      log.job('Received mapper data')
      ctx.mapperResults = ctx.mapperResults.concat(data)
      ctx.mapperResultCount++
      if (ctx.mapperNodes.length === ctx.mapperResultCount) {
        handleMapperResults(ctx)
      }
      break;

    case REDUCER_WORKER:
      log.job('Received reducer data')
      ctx.reducerResults = ctx.reducerResults.concat(data)
      ctx.resultsCount++
      if (ctx.reducerNodes.length === ctx.resultsCount) {
        const timeTaken = Date.now() - ctx.timestampStart
        ctx.onResult(ctx.reducerResults, timeTaken)
      }
      break;

    default:
      break;
  }
  log.jobData('Received data: %O', data)
}

/**
 * Function used to launch the job
 * @param {*} ctx context
 */
const run = ctx => async () => {
  try {
    ctx.timestampStart = Date.now()
    let data = await getProcessor(ctx.config)
    ctx.mapperNodes = getMapNodes(ctx)

    if (ctx.mapperNodes.length === 0) {
      log.job('No mapper nodes available, retrying...')
      setTimeout(() => {
        run(ctx)()
      }, 1000)
      return
    }
    log.job('Mapper nodes found.')

    data = spreadData(ctx, data)

    sendMapperData(
      ctx.jobId,
      ctx.mapConf.funcName,
      data,
      ctx.mapperNodes,
    )
  } catch (error) {
    throw new Error(`Could not process data: ${error.message}`)
  }
}

/**
 * Job constructor
 * @param {*} config job configuration
 */
function Job({ id, nodes, config, type }) {
  this.jobId = id
  this.nodes = nodes
  this.config = config
  this.type = type

  this.timestampStart = Date.now()

  this.mapperResults = []
  this.reducerResults = []

  this.mapperResultCount = 0
  this.resultsCount = 0

  this.onReceiveData = handleReceiveData(this)

  this.map = map(this)
  this.run = run(this)
}

module.exports = Job
