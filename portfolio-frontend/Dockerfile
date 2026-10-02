# build stage
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine AS production-stage
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build-stage /app/dist .

# Add nginx config
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./docker/40-writing-proxy.sh /docker-entrypoint.d/40-writing-proxy.sh
RUN chmod 755 /docker-entrypoint.d/40-writing-proxy.sh
COPY ./security-headers.conf /etc/nginx/security-headers.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]