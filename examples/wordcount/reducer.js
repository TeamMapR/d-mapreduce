const mapreduce = require('../../index')

const reducer = mapreduce.Reducer({
  master: 'localhost:8080',
})

reducer.register('wordCount', (data) => {

})
