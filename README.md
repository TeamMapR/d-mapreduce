# d-mapreduce
A distributed mapreduce framework for nodejs

[Todo list](TODO.md)

## Authors
- Guillaume Carré
- Arfaz Feroz
- Côme Cothenet

## Example

To run the wordcount example with docker:
```
docker-compose -f word-count-example.yml up -d mapper reducer
```
```
docker-compose -f word-count-example.yml scale mapper=6 reducer=3
```
```
docker-compose -f word-count-example.yml up -d master
```
The results are written in the file out.txt
