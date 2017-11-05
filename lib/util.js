const fs = require('fs')

const readFile = url => new Promise((res, rej) =>
  fs.readFile(url, 'utf8', (err, data) => {
    if (err) return rej(err)
    return res(data)
  }))

module.exports = {
  readFile,
}
