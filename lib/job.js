
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

const getMapNodes = ctx => {
  const nodes = Array.from(ctx.nodes.values())
    .filter(n => n.type === MAPPER_WORKER)
  const nb = Math.min(nodes.length, ctx.mapConf.workersNb)
  return nodes.slice(0, nb)
}

const getReducerNodes = ctx => {
  const nodes = Array.from(ctx.nodes.values())
    .filter(n => n.type === REDUCER_WORKER)
  const nb = Math.min(nodes.length, ctx.reduceConf.workersNb)
  return nodes.slice(0, nb)
}

const handleMapperResults = ctx => {
  ctx.reducerNodes = getReducerNodes(ctx)
  const shuffled = shuffle(ctx.mapperResults, ctx.reducerNodes)
  sendReducerData(
    ctx.jobId,
    ctx.reduceConf.funcName,
    shuffled,
    ctx.reducerNodes,
  )
}


const handleReceiveData = ctx => (type, data) => {
  switch (type) {
    case MAPPER_WORKER:
      console.log('received mapper data')
      ctx.mapperResults = ctx.mapperResults.concat(data)
      ctx.mapperResultCount++
      if (ctx.mapperNodes.length === ctx.mapperResultCount) {
        handleMapperResults(ctx)
      }
      break;

    case REDUCER_WORKER:
      console.log('received reducer data', data)
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
}

const run = ctx => async () => {
  try {
    ctx.timestampStart = Date.now()
    let data = await getProcessor(ctx.config)
    ctx.mapperNodes = getMapNodes(ctx)

    if (ctx.mapperNodes.length === 0) {
      setTimeout(() => {
        run(ctx)()
      }, 1000)
      return
    }


    data = spreadData(ctx, data)

    sendMapperData(
      ctx.jobId,
      ctx.mapConf.funcName,
      data,
      ctx.mapperNodes,
    )
  } catch (error) {
    console.error(`Could not process data: ${error.message}`, error)
  }
}

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
