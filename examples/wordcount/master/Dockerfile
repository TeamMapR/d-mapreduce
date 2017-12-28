FROM node:alpine

COPY package.json /data/
COPY lib /data/lib/
COPY examples /data/examples/
COPY index.js /data/


WORKDIR /data
ENV NODE_ENV=production
RUN npm install

EXPOSE 8080

WORKDIR /data/examples/wordcount

CMD ["node", "master.js"]