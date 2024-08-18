FROM node:16-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install --force
COPY . .

RUN npm run build


#Stage build nginx server as a server side to run the image
FROM nginx:1.19.0
WORKDIR /usr/share/nginx/html
RUN chgrp -R root /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R 770 /var/cache/nginx /var/run /var/log/nginx
RUN chmod -R ugo+rw,+X /usr/share/
RUN rm -rf ./*

COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8087
ENTRYPOINT [ "nginx","-g","daemon off;" ]