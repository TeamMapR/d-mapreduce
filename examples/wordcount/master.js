const mapreduce = require('../../index')
const fs = require('fs')

const master = mapreduce.Master({
  port: 8080,
})


const job = master.processFile({
  url: './files/test.txt',
  separator: '\n',
})

if (!fs.existsSync('./out')) {
  fs.mkdirSync('./out')
}

job
  .map('wordCount', 3)
  .reduce('wordCount', 2)
  .result((data, duration) => {
    let lines = data.map(kv => `${kv.key}: ${kv.value}`).join('\n')
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((duration % (1000 * 60 * 60)) / 1000)
    const ms = Math.floor(duration % (1000 * 60 * 60))
    lines = `time: ${minutes}m${seconds}s${ms}ms\n${lines}`
    console.log('writing results..')
    fs.writeFile('./out/out.txt', lines, (err) => {
      if (err) {
        console.error(err)
      }
      console.log('success !')
    })
  })


// setTimeout(() => {
console.log('running job..')
job.run()
// }, 5000);
