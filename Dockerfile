FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY dist/tickets_frontend /usr/share/nginx/html

EXPOSE 22227

CMD ["nginx", "-g", "daemon off;"]