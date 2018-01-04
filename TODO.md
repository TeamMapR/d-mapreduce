# TODO

## Minimal release

### Master
- [X] Input file
- [X] Split function (allow to customize it)
- [X] Create the job
  - [X] Choose nb of mapper, reducer
  - [X] Choose the functions

### Mapper
- [X] get data split from master
- [X] functions must return list of key-value
- [X] result is sent back to master

### Shuffle
- [X] The master node gathers the key-values from the worker nodes
- [X] the key-values are grouped by key and assigned to reducer nodes (hash(key) modulo reducers nb)


### Reducer
- [X] the list of key-values are sent to the reducer nodes
- [X] the key-values are grouped and sorted and sent back to the master node

## Improvements

- [ ] Jobs queue on workers
- [ ] Handle node disconnect when a job is processing
