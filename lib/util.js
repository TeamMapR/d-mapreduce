const fs = require('fs')
const crypto = require('crypto')

const readFile = url => new Promise((res, rej) =>
  fs.readFile(url, 'utf8', (err, data) => {
    if (err) return rej(err)
    return res(data)
  }))

const spreadData = (ctx, data) => {
  const dataSplitted = data.split(ctx.config.separator)
  const numMapper = Math.min(ctx.mapConf.workersNb, ctx.mapperNodes.length)
  const groupSize = parseInt(dataSplitted.length / numMapper, 10)
  const grouped = []

  for (let i = 0; i < numMapper; i++) {
    let size = 0
    const group = []
    while (size < groupSize) {
      group.push(dataSplitted.pop().trim())
      size++
    }
    if (i === numMapper - 1) {
      while (dataSplitted.length !== 0) {
        group.push(dataSplitted.pop().trim())
      }
    }
    grouped.push(group)
  }
  return grouped
}


const hashSpread = (key, nodesNb) => {
  const hash = crypto.createHash('md5').update(key).digest('hex')
  return (parseInt(hash.substr(0, 5), 16) % (nodesNb))
}

const shuffle = (data, nodes) => {
  const grouped = Array.from(Array(nodes.length)).map(() => [])
  data.forEach(kv => {
    grouped[hashSpread(kv.key, nodes.length)].push(kv)
  })
  return grouped
}

module.exports = {
  readFile,
  spreadData,
  shuffle,
}
