# FROM node:12.13.1
FROM node:10.16.1-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install
COPY . .
RUN yarn tsc --project .

EXPOSE 3000

CMD ["node", "dist/index.js"]