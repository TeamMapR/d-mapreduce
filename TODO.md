# TODO

## Master
- Input file
- Split function (allow to customize it)
- Create the job
  - Choose nb of mapper, reducer
  - Choose the functions

## Mapper
- get data split from master
- functions must return list of key-value
- result is sent back to master

## Shuffle
- The master node gathers the key-values from the worker nodes
- the key-values are grouped by key and assigned to reducer nodes (hash(key) modulo reducers nb)


## Reducer
- the list of key-values are sent to the reducer nodes
- the key-values are grouped and sorted and sent back to the master node