const FILE_TYPE = 'file'

const MAP_PROCESS_TYPE = 'map'
const REDUCE_PROCESS_TYPE = 'reduce'
const SHUFFLE_PROCESS_TYPE = 'shuffle'

const map = ctx => (funcName, workersNb) => {
  ctx.operations.push({
    type: MAP_PROCESS_TYPE,
    funcName,
    workersNb,
  })
  return ctx
}

const reduce = ctx => (funcName, workersNb) => {
  ctx.operations.push({
    type: REDUCE_PROCESS_TYPE,
    funcName,
    workersNb,
  })
  return ctx
}

const shuffle = ctx => () => {
  ctx.operations.push({
    type: SHUFFLE_PROCESS_TYPE,
  })
  return ctx
}

const result = ctx => callback => {

}

const run = ctx => () => {

}

function Job({ nodes, config, type }) {
  this.nodes = nodes;
  this.config = config;
  this.type = type;
  this.operations = []

  this.map = map(this)
  this.reduce = reduce(this)
  this.shuffle = shuffle(this)
  this.result = result(this)

  this.run = run(this)

  /*
  switch (config.type) {
    case FILE_TYPE:

      break;

    default:
      throw new Error(`${config.type} is not supported`)
  }
  */
  return this
}

module.exports = {
  // Process types
  FILE_TYPE,

  Job,
}
