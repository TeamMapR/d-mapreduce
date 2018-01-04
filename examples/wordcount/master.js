const mapreduce = require('../../index')
const fs = require('fs')
const path = require('path')

const master = mapreduce.Master({
  port: 8080,
})

if (!fs.existsSync('./out')) {
  fs.mkdirSync('./out')
}

function processFile(file) {
  const job = master.processFile({
    url: `./files/${file}`,
    separator: '\n',
  })

  job
    .map('wordCount', 5)
    .reduce('wordCount', 2)
    .result((data, duration) => {
      // écrit les résultats dans un fichier
      let lines = data.map(kv => `${kv.key}: ${kv.value}`).join('\n')
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((duration % (1000 * 60 * 60)) / 1000)
      const ms = Math.floor(duration % (1000 * 60 * 60))
      lines = `time: ${minutes}m${seconds}s${ms}ms\n${lines}`
      console.log('writing results..')
      fs.writeFile(`./out/out-${path.parse(file).name}.txt`, lines, (err) => {
        if (err) {
          console.error(err)
        }
        console.log('success !')
      })
    })

  console.log('running job..')
  job.run()
}

function run() {
  fs.readdir('./files', (err, fileNames) => {
    if (err) throw err
    fileNames.forEach(fileName => {
      // if not a hidden file
      if (fileName.charAt(0) !== '.') {
        processFile(fileName)
      }
    })
  })
}

run()
// setInterval(run, 10 * 1000)
