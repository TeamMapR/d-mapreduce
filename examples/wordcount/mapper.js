const mapreduce = require('../../index')

const mapper = mapreduce.Mapper({
  master: `${process.env.MASTER_ADDR || 'localhost'}:8080`,
})

mapper.register('wordCount', (data) => {
  // separe les lignes du fichier en mots, groupe les
  // mots et les compte => [{ key: 'mot', value: 1 }, ... ]
  const keyvalues = data.reduce((all, line) => {
    const lines = line
      .replace(/[!?,\-_\.]/g, '\n')
      .replace(/ /g, '\n')
      .split('\n')
      .filter(fw => fw !== '')
      .map(word => {
        const pword = word.trim()
        return { key: pword, value: 1 }
      })
    return all.concat(lines)
  }, [])
  return keyvalues
})


mapper.run(() => {
  console.log('Mapper connected to master')
})
