const crypto = require('crypto')
const { readFile } = require('./util')

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
  const nb = nodes.length < ctx.mapConf.workersNb ?
    nodes.length : ctx.mapConf.workersNb
  return nodes.slice(0, nb)
}

const getReducerNodes = ctx => {
  const nodes = Array.from(ctx.nodes.values())
    .filter(n => n.type === REDUCER_WORKER)
  const nb = nodes.length < ctx.reduceConf.workersNb ?
    nodes.length : ctx.reduceConf.workersNb
  return nodes.slice(0, nb)
}

const spreadData = (ctx, data) => {
  const dataList = data.split(ctx.config.split)
  const numMapper = ctx.mapConf.workersNb
  const groupSize = parseInt(dataList.length / numMapper, 10)
  const grouped = []

  for (let i = 0; i < numMapper; i++) {
    let size = 0
    const group = []
    while (size <= groupSize) {
      group.push(dataList.pop())
      size++
    }
    if (i === numMapper - 1) {
      while (dataList.length !== 0) {
        group.push(dataList.pop())
      }
    }
    grouped.push(group)
  }
  return grouped
}

const hashSpread = (key, nodesNb) => {
  const hash = crypto.createHash('md5').update(key).digest('hex')
  return parseInt(hash, 16) % nodesNb
}

const shuffle = (data, nodes) => {
  console.log(data)
  const grouped = Array.from(Array(nodes.length)).map(() => [])
  data.forEach(kv => {
    grouped[hashSpread(kv.key, nodes.length)].push(kv.value)
  })
  return grouped
}

const handleMapperResults = ctx => {
  const reducerNodes = getReducerNodes(ctx)
  const shuffled = shuffle(ctx.mapperResults, reducerNodes)
  sendReducerData(
    ctx.jobId,
    ctx.reduceConf.funcName,
    shuffled,
    reducerNodes,
  )
}


const handleReceiveData = ctx => (type, data) => {
  switch (type) {
    case MAPPER_WORKER:
      ctx.mapperResults.push(data)
      if (ctx.mapperNodes.length === ctx.mapperResults.length) {
        handleMapperResults(ctx)
      }
      break;

    case REDUCER_WORKER:
      ctx.reducerResults.push(data)
      if (ctx.reducerNodes.length === ctx.reducerResults.length) {
        ctx.onResult(ctx.reducerResults)
      }
      break;

    default:
      break;
  }
}

const run = ctx => async () => {
  try {
    let data = await getProcessor(ctx.config)
    data = spreadData(ctx, data)

    ctx.mapperNodes = getMapNodes(ctx)
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

  this.mapperResults = []
  this.reducerResults = []

  this.onReceiveData = handleReceiveData(this)

  this.map = map(this)
  this.run = run(this)
}

module.exports = Job
