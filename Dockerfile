# Use an official Node.js runtime as the base image
FROM node:14-alpine

WORKDIR /app

COPY . /app

RUN npm install

COPY . .

EXPOSE 3000

ENV NAME shopping-cart

CMD ["npm", "start"]
