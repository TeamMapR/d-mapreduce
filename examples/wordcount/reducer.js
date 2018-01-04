const mapreduce = require('../../index')

const reducer = mapreduce.Reducer({
  master: `${process.env.MASTER_ADDR || 'localhost'}:8080`,
})

reducer.register('wordCount', (data) => {
  const keys = data.reduce((all, w) => {
    if (all[w.key]) {
      all[w.key] += w.value
      return all
    }
    all[w.key] = w.value
    return all
  }, {})

  return Object.keys(keys)
    .map(k => ({ key: k, value: keys[k] }))
})

reducer.run(() => {
  console.log('Reducer connected to master')
})
