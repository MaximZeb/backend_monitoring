FROM node:16.20.0

RUN cd /dist

CMD ["node", "index.js"]
