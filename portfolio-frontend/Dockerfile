# build stage
FROM node:17.8.0-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build-stage /app/dist .

# Add nginx config
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
