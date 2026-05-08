FROM nginx:alpine

LABEL maintainer="love-space"
LABEL description="甜蜜空间 - 情侣专属网页"

COPY . /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]