FROM node:24-alpine AS build
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm cache clean --force && npm install
COPY . ./

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

EXPOSE 80


