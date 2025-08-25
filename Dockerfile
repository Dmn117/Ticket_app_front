FROM nginx:alpine

COPY dist/tickets_frontend /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./LICENSE ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]