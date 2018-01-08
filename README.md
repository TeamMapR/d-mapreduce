# d-mapreduce
A distributed mapreduce framework for nodejs

## Install

```
npm install --save d-mapreduce
```

## Usage

You will need to create at least 3 nodejs servers, one master, one reducer and one mapper.

### Master

```javascript
const mapreduce = require('d-mapreduce')

const master = mapreduce.Master({
  port: 8080
})

const job = master.processFile({
  url: 'example.txt',
  separator: '\n',
})

job
  .map('mapperFunction', 5)
  .reduce('reducerFunction', 2)
  .result((data, duration) => {
    // do what you want
  })

job.run() // launch the job
```

### Mapper
```javascript
const mapreduce = require('d-mapreduce')

const mapper = mapreduce.Mapper({
  master: 'localhost:8080',
})

mapper.register('mapperFunction', (data) => {
  // TODO: implement mapper
  // should return [{ key: <yourkey>, value: <yourvalue> }, ...]
})

mapper.run()
```

### Reducer
```javascript
const mapreduce = require('d-mapreduce')

const reducer = mapreduce.Mapper({
  master: 'localhost:8080',
})

reducer.register('reducerFunction', (data) => {
  // TODO: implement reducer
  // should return [{ key: <yourkey>, value: <yourvalue> }, ...]
})

reducer.run()
```

## Links
- [Todo list](TODO.md)
- [Features proposal](PROPOSAL.md)

## Examples
- [Word count](examples/wordcount)

## Authors
- Guillaume Carré
- Arfaz Feroz
- Côme Cothenet
