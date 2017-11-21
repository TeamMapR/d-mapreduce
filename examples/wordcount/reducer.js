const mapreduce = require('../../index')

const reducer = mapreduce.Reducer({
  master: 'localhost:8080',
})

reducer.register('wordCount', (data) => {

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


const run = () => {
  reducer.run(() => {
    setTimeout(() => {
      run()
    }, 2000);
  })
}

run()
