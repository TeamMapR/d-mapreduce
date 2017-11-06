const mapreduce = require('../../index')

const mapper = mapreduce.Mapper({
  master: 'localhost:8080',
})

mapper.register('wordCount', (data) => {
  const keys = data.reduce((all, w) => {
    if (all[w]) {
      all[w]++
      return all
    }
    all[w] = 1
    return all
  }, {})
  return Object.keys(keys)
    .map(k => ({ key: k, value: keys[k] }))
})

mapper.run()
