const mapreduce = require('../../index')

const reducer = mapreduce.Reducer({
  master: 'localhost:8080',
})

reducer.register('wordCount', (data) => {
  const keys = data.reduce((all, w) => {
    if (all[w.key]) {
      all[w.key]++
      return all
    }
    all[w.key] = 1
    return all
  }, {})

  return Object.keys(keys)
    .map(k => ({ key: k, value: keys[k] }))
})

reducer.run()
