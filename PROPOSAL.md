# Features proposal

```javascript
const mapreduce = require('d-mapreduce')

// Master (name node)
const master = mapreduce.Master({
  port: 8080,
})

const job = master.processFile({
  url: 'test.txt',
  split: '\n'
})

job
  .map('mapCountWord', 6)
  .reduce('reduceCountWord', 3)
  .result((data) => {
    console.log(data)
  })

job.run()


// Map Worker (data node)

const workerMapper = mapreduce.Worker({
  master: 'http://localhost:8080',
})

workerMapper.register('mapCountWord', (data) => {
  
  words = data.split(' ')
  keys = words.reduce((all, w => {
    if (all[w]) {
      all[w]++
      return all
    }
    all[w] = 1
    return all
  }, {}))

  return objToKV(keys)
})

workerMapper.run()


// Reduce Worker (data node)

const workerReducer = mapreduce.Worker({
  master: 'http://localhost:8080',
})

workerReducer.register('reduceCountWord', (data) => {
  return {
    key: 'World',
    value: 4,
  }  
})

workerReducer.run()

```