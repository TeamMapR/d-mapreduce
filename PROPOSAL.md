# Features proposal

```javascript
const mapreduce = require('d-mapreduce')
const master = mapreduce.Master({
  port: 8080,
})

const job = master.processFile({
  url: 'test.txt',
  separator: '\n'
})

job
  .map('countWordMap', 6)
  .shuffle()
  .reduce('countWordReduce', 3)
  .end((data) => {
    console.log(data)
  })

job.run()


const worker = mapreduce.Worker({
  master: 'http://localhost:8080',
  type: mapreduce.TypeMapper
})

workerMapper.func('countWordMap', (item) => {
  
})

workerMapper.run(8081)


const workerReducer = worker({
  master: 'http://localhost:8080',
  type: mapreduce.TypeReducer
})

workerReducer.func('countWordReduce', (all, e) => {
  
})

workerReducer.run(8082)

```