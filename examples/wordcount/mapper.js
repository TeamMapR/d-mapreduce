const mapreduce = require('../../index')

const mapper = mapreduce.Mapper({
  master: `${process.env.MASTER_ADDR || 'localhost'}:8080`,
})

mapper.register('wordCount', (data) => {
  const keys = data.reduce((all, w) => {
    w.replace(/[!?,\-_\.]/g, '\n')
      .replace(/ /g, '\n')
      .split('\n')
      .filter(fw => fw !== '')
      .forEach(word => {
        const pword = word.trim()
        if (all[pword]) {
          all[pword]++
        } else {
          all[pword] = 1
        }
      })
    return all
  }, {})
  return Object.keys(keys)
    .map(k => ({ key: k, value: keys[k] }))
})


mapper.run()
