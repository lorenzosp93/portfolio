# base image
FROM node:12.2.0-alpine
# set working directory

RUN mkdir /app
WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]