FROM arm64v8/node:20.9.0
# FROM --platform=linux/amd64 node:20.9.0
# FROM node:20.9.0-alpine
# FROM node:20.9.0


WORKDIR /usr/src/app

COPY . .

RUN npm install

# RUN npm i -g @nestjs/cli@10.1.16

# CMD ["nest", "start", "--watch"]
CMD ["npm", "run", "start:dev"]