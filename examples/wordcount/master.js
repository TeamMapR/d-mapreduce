const mapreduce = require('../../index')

const master = mapreduce.Master({
  port: 8080,
})


const job = master.processFile({
  url: 'test.txt',
  separator: '\n',
})

job
  .map('wordCount', 3)
  .reduce('wordCount', 2)
  .result((data) => {
    console.log(data)
  })


setTimeout(() => {
  job.run()
}, 5000);
