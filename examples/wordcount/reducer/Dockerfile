FROM node:alpine

COPY package.json /data/
COPY lib /data/lib/
COPY examples /data/examples/
COPY index.js /data/


WORKDIR /data

ENV NODE_ENV=production
ENV MASTER_ADDR=master

RUN npm install

EXPOSE 8080

CMD ["node", "/data/examples/wordcount/reducer.js"]