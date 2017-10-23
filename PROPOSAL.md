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
  .result((data) => {
    console.log(data)
  })

job.run()


const countWordMap = (item) => {

}

const workerMapper = mapreduce.Worker({
  master: 'http://localhost:8080',
  mappers: {
    countWordMap
  }
})

workerMapper.run()


const countWordReduce = (all, e) => {

}

const workerReducer = mapreduce.Worker({
  master: 'http://localhost:8080',
  reducers: {
    countWordReduce
  }
})

workerReducer.run()

```