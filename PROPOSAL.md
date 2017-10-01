# Features proposal

```javascript
const mapreduce = require('d-mapreduce')
const master = mapreduce.Master
const worker = mapreduce.Worker

const job = master.processFile({
  url: 'test.txt',
  separator: '\n'
})

job
  .map('countWordMap')
  .shuffle()
  .reduce('countWordReduce')
  .end((data) => {
    console.log(data)
  })

job.run(8080)


const w = worker({
  master: 'http://localhost:8080',
  type: mapreduce.TypeMapper
})

w.func('countWordMap', (k, v) => {
  
})

w.run(8081)


const w1 = worker({
  master: 'http://localhost:8080',
  type: mapreduce.TypeReducer
})

w1.func('countWordReduce', (all, e) => {
  
})

w1.run(8082)

```