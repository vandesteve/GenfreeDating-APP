FROM node:alpine

RUN mkdir -p /app
WORKDIR /app

# 👇 CRITICAL ADDITION: Install build tools for native npm modules (like bcrypt)
# build-base provides gcc, g++, and make. python3 is required by node-gyp.
RUN apk update && \
    apk add --no-cache build-base python3

COPY package.json ./
COPY package-lock.json ./
COPY ./ ./

RUN npm i
CMD ["npm", "run", "dev"]