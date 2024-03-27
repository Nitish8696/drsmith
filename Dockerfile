FROM node:20 as builder

WORKDIR /build

COPY package*.json .
RUN npm install

COPY . .
